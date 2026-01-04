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


// ✅ Prometheus metrics
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

// ✅ Allowed origins
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://d34mrc34hspmeg.cloudfront.net',  // Your frontend CloudFront
  'http://localhost:3000',                   // Local dev
  'http://localhost:5173'                    // Vite local dev
].filter(Boolean);

// ✅ CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
  maxAge: 86400  // 24 hours
};

// ✅ Apply CORS middleware
app.use(cors(corsOptions));

// ✅ Handle preflight requests globally
app.options("*", cors(corsOptions));

// ✅ Middlewares
app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ✅ Routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/items", itemRoutes);
app.use("/swaps", swapRoutes);
app.use("/admin", adminRoutes);

// ✅ Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// ✅ Database connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));