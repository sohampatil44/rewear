import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import client from "prom-client";
import authRoutes from "./routes/auth.js";
import userRoutes from './routes/user.js';
import itemRoutes from './routes/items.js';
import swapRoutes from './routes/swaps.js';
import adminRoutes from "./routes/admin.js"; // Move this up
import path from "path";

dotenv.config();
const app = express();
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/swaps", swapRoutes);
app.use("/api/admin", adminRoutes); // Moved here

mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error(err));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
