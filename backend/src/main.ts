import express, { Request, Response } from "express";
import cors from "cors";
import { userRouter } from "./routes/user";
import { postRouter } from "./routes/posts";
import authenticateUser from "./middleware/auth.middleware";
import { prisma } from "./utils/prisma";
const app = express();
const dotenv = require("dotenv");
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

app.listen(4000, () => {
  console.log("Server is running on port 4000");
});
