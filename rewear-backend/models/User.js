import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  points: { type: Number, default: 100 },
  isAdmin: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model("User", userSchema);
