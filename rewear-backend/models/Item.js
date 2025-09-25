import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String },
  image: { type: String }, // saved path for uploaded image
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Item", itemSchema);
