import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import client from "prom-client";
import authRoutes from "./routes/auth.js";
import userRoutes from './routes/user.js';
import itemRoutes from './routes/items.js';
import swapRoutes from './routes/swaps.js';
import adminRoutes from "./routes/admin.js";
import path from "path";

dotenv.config();
const app = express();

app.use((req, res, next) => {
  console.log(`➡️  ${req.method} ${req.originalUrl}`);
  next();
});

const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://d34mrc34hspmeg.cloudfront.net',
  'http://localhost:3000',
  'http://localhost:5173'
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Cache-Control", "Pragma", "Expires"],
  credentials: true,
  maxAge: 86400
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ✅ Routes - CORRECT ORDER
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/items", itemRoutes);      // ✅ Items routes (includes /my-items)
app.use("/swaps", swapRoutes);      // ✅ Swaps routes
app.use("/admin", adminRoutes);     // ✅ Admin routes

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));