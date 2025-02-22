const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const express = require("express");
const axios = require("axios");
// const { Server } = require("socket.io");
const http = require("http");
// const connectMongoDB = require("./connection");
const cors = require("cors");

dotenv.config();
const app = express();
const server = http.createServer(app);

// connectMongoDB(process.env.MONGODB_CONNECT_URI)
//   .then((value) => {
//     console.log("server connected");
//   })
//   .catch((err) => {
//     console.log(err);
//   });
app.use(
  cors({
    origin: "http://localhost:3000", // Allow requests from your Next.js frontend
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const apiKey = process.env.GEMINI_API_KEY;
const ELEVEN_LABS_API_KEY = process.env.ELEVEN_LABS_API_KEY;
const VOICE_ID = process.env.VOICE_ID;
const OPEN_WEATHER_API_KEY=process.env.OPEN_WEATHER_API_KEY;
const GOOGLE_API_KEY=process.env.GOOGLE_API_KEY;

const genAI = new GoogleGenerativeAI(apiKey);

// Store the conversation history for each user session
const userHistories = {};

app.use(express.json());

app.get("/", (req, res) => {
  console.log("Hello World");
  res.send("Hello World");
});
async function getWeather(location) {
  try {
      // Get coordinates from Google Geocoding API
      const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${GOOGLE_API_KEY}`;
      const geoResponse = await axios.get(geoUrl);

      if (!geoResponse.data.results.length) throw new Error("Location not found");

      const { lat, lng } = geoResponse.data.results[0].geometry.location;
      const address = geoResponse.data.results[0].formatted_address;

      // Get weather data from OpenWeatherMap API
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${OPEN_WEATHER_API_KEY}&units=metric`;
      const weatherResponse = await axios.get(weatherUrl);

      return {
          location: address,
          coordinates: { lat, lng },
          weather: {
              temperature: weatherResponse.data.main.temp,
              feels_like: weatherResponse.data.main.feels_like,
              humidity: weatherResponse.data.main.humidity,
              description: weatherResponse.data.weather[0].description,
              wind_speed: weatherResponse.data.wind.speed
          },
          timestamp: new Date().toISOString(),
          intent: "weather_analysis"
      };
  } catch (error) {
      console.error('Error:', error.message);
      return { error: "Unable to fetch weather data", details: error.message };
  }
}

app.get("/weather", async (req, res) => {
  const { location } = req.query;
  console.log(location)
  if (!location) return res.status(400).json({ error: "Location parameter is required" });

  const data = await getWeather(location);
  res.json(data);
});


app.post("/generate-voice", async (req, res) => {
  const { userId, text, role } = req.body;
  console.log("userId", userId);
  console.log("text", text);

  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-exp",
    systemInstruction: `You are an AI interviewer Saarthi AI designed to conduct mock job interviews for candidates applying for a ${role}.  
Your job is to ask relevant, structured, and engaging questions, adapting dynamically based on the candidate’s responses.  

### Interview Flow:
1. **Introduction**
   - Start the conversation warmly by introducing yourself as the interviewer.  
   - Briefly explain the interview process.  
   - Ask the candidate to introduce themselves.

2. **Technical / Behavioral Questions**  
   - Ask one question at a time, adjusting based on the candidate’s previous answers.  
   - Encourage detailed responses and follow up with clarifications if needed.  
   - Ensure the conversation feels natural, with pauses for the candidate to respond.

3. **Situational & Problem-Solving Questions**  
   - Provide real-world scenarios and ask the candidate how they would handle them.  
   - Challenge them with hypothetical problems to assess their thinking.  

4. **Closing the Interview**  
   - Ask if the candidate has any questions.  
   - Thank them for their time and provide brief feedback on how they did.

### Tone & Personality:  
- Maintain a formal yet conversational tone, similar to real-world interviews.  
- Show interest in the candidate’s responses, and adapt your questions accordingly.  
- If a candidate struggles, encourage them politely instead of pressuring them.  

### Example Opening:  
"Hello, I’m SarthiAI, and I’ll be your interviewer today. Thank you for taking the time for this mock interview. This session will include a mix of technical and behavioral questions to assess your skills for the [ROLE] position.  
Before we begin, could you introduce yourself and tell me a little about your background?"
`,
  });

  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
  };

  // Retrieve or initialize the user's history
  const userHistory = userHistories[userId] || [];
  console.log("userHistory", userHistory);

  try {
    // Generate AI response
    const chatSession = model.startChat({
      generationConfig,
      history: [...userHistory, { role: "user", parts: [{ text }] }],
    });

    const result = await chatSession.sendMessage(text);
    let aiResponse = result.response.text();
    aiResponse = aiResponse.replace(/[^a-zA-Z0-9 ]/g, "");

    // Update conversation history
    userHistories[userId] = [
      ...userHistory,
      { role: "user", parts: [{ text }] },
      { role: "model", parts: [{ text: aiResponse }] },
    ];

    // Generate speech
    const voiceResponse = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      { text: aiResponse },
      {
        headers: {
          "xi-api-key": ELEVEN_LABS_API_KEY,
          "Content-Type": "application/json",
        },
        responseType: "arraybuffer",
      }
    );

    // Send both audio and text response
    res.set({
      "Content-Type": "application/json",
    });

    res.send({
      audio: Buffer.from(voiceResponse.data).toString("base64"),
      text: aiResponse,
      success: true,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      error: "Error generating response or voice",
    });
  }
});

server.listen(6000, () => {
  console.log("Server running on port 6000");
});
