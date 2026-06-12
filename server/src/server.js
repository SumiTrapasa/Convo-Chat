import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";
import dns from "dns";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import aiRoutes from "./routes/ai.route.js";
import { connectDB } from "./lib/db.js";
import { ENV } from "./lib/env.js";
import { app, server } from "./lib/socket.js";

dns.setServers(["1.1.1.1", "8.8.8.8"]);
const PORT = ENV.PORT || 3000;

app.use(cors({ origin: [ENV.CLIENT_URL], credentials: true }));
app.use(express.json({ limit: "5mb" })); // req.body
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/ai", aiRoutes);

server.listen(PORT, () => {
  console.log("Server running on port: " + PORT);
  connectDB();
});
