import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import userRoutes from './routes/user.js'; // Make sure this is imported
import itemRoutes from './routes/items.js';
import swapRoutes from './routes/swaps.js';
import path from "path";    

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/swaps", swapRoutes);
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));


app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes); // Use the user routes
app.use("/api/items", itemRoutes);
app.use("/api/swaps", swapRoutes);

mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

import adminRoutes from "./routes/admin.js";
app.use("/api/admin", adminRoutes);
