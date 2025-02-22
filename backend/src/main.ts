import express, { Request, Response } from "express";
import cors from "cors";
import { userRouter } from "./routes/user";
import { postRouter } from "./routes/posts";
import { incidentRouter } from "./routes/inicident";
import authenticateUser from "./middleware/auth.middleware";
import { prisma } from "./utils/prisma";
import { Client, LocalAuth } from "whatsapp-web.js";
const app = express();
const dotenv = require("dotenv");
const qrcode = require("qrcode-terminal");

dotenv.config();
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.get("/dashboard", authenticateUser, (req, res) => {
  res.json({ message: "Welcome to the dashboard", user: req });
});

app.get("/", (req, res) => {
  res.json({ message: "Public Route" });
});
app.use("/user", userRouter);
app.use("/posts", postRouter);
app.use("/incident", incidentRouter);

app.post("/signup", async (req, res) => {
  const { email, name, image } = req.body;

  try {
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: { email, name },
      });
    }

    console.log("user Created", user);

    res.json(user);
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// app.get('/', (req, res) => {
//   res.send('WhatsApp Bot Server is running');
// });

app.post("/api/emergency", async (req: any, res: any) => {
  try {
    const { eventType, numbers, location } = req.body;
    console.log("request recieved");

    if (!eventType || !numbers || !Array.isArray(numbers)) {
      return res.status(400).json({
        error:
          "Invalid request. Required: eventType (string) and numbers (array)",
      });
    }

    // Construct emergency message
    const emergencyMessage =
      `⚠️ EMERGENCY ALERT ⚠️\n\n` +
      `A ${eventType} has been reported${
        location ? ` at ${location}` : ""
      }.\n` +
      `Please stay away from the affected area and stay safe.\n\n` +
      `This is an automated emergency alert.`;

    console.log("message", emergencyMessage);

    // Send message to all numbers in the array
    const sendPromises = numbers.map(async (number) => {
      try {
        // Format number to WhatsApp format (add @c.us)
        const formattedNumber = number.replace(/[^0-9]/g, "") + "@c.us";
        await client.sendMessage(formattedNumber, emergencyMessage);
        console.log(`Sent to ${number}`);
        return { number, status: "success" };
      } catch (error: any) {
        console.error(`Failed to send to ${number}:`, error);
        return { number, status: "failed", error: error.message };
      }
    });

    const results = await Promise.all(sendPromises);

    res.json({
      success: true,
      message: "Emergency notifications sent",
      results,
    });
  } catch (error) {
    console.error("Emergency notification error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to send emergency notifications",
    });
  }
});

export const client = new Client({
  authStrategy: new LocalAuth(), // This stores authentication credentials to avoid scanning QR repeatedly
});
let botStartTime = new Date();

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
  console.log("Scan the QR code above to login.");
});

client.on("ready", () => {
  console.log("WhatsApp Web Client is ready!");
  botStartTime = new Date();
});

client.on("message_create", (msg) => {
  if (msg.fromMe) {
    console.log("Message created by bot:", msg.body);
  }
});

client.on("auth_failure", () => {
  console.log("Authentication failure. Restart the process.");
});

// Initialize WhatsApp client
client.initialize();

app.listen(4000, () => {
  console.log("Server is running on port 4000");
});
