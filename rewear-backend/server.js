import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import client from "prom-client";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import itemRoutes from "./routes/items.js";
import swapRoutes from "./routes/swaps.js";
import adminRoutes from "./routes/admin.js";
import path from "path";

dotenv.config();
const app = express();

/* -------------------- Logger -------------------- */
app.use((req, res, next) => {
  console.log(`➡️  ${req.method} ${req.originalUrl}`);
  next();
});

/* -------------------- Prometheus Metrics -------------------- */
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

/* -------------------- CORS -------------------- */
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "https://d34mrc34hspmeg.cloudfront.net",
  "http://localhost:3000",
  "http://localhost:5173"
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Cache-Control",
    "Pragma",
    "Expires"
  ],
  credentials: true,
  maxAge: 86400
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

/* -------------------- Middlewares -------------------- */
app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

/* -------------------- Routes -------------------- */
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/items", itemRoutes);
app.use("/swaps", swapRoutes);
app.use("/admin", adminRoutes);

/* -------------------- Health Check -------------------- */
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString()
  });
});

/* -------------------- Metrics Endpoint -------------------- */
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
});

/* -------------------- MongoDB -------------------- */
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) =>
    console.error("❌ MongoDB connection error:", err)
  );

/* -------------------- Server -------------------- */
const PORT = process.env.PORT || 5001;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
