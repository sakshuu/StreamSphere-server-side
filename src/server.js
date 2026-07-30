import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import libraryRoutes from "./routes/libraryRoutes.js";

const app = express();
app.use(
  cors({
    origin:
      process.env.CLIENT_ORIGIN ||
      "https://stream-sphere-client-side.vercel.app",
    credentials: true,
  }),
);
// app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:3000/", credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/library", libraryRoutes);
app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: "Something went wrong. Please try again." });
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() =>
    app.listen(process.env.PORT || 5000, () =>
      console.log(`StreamSphere API running on ${process.env.PORT || 5000}`),
    ),
  )
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });
