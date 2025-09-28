import mongoose from "mongoose";

const ItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  imageUrl: { type: String, required: true },
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  condition: { type: String },
  isApproved: { type: Boolean, default: false },  // 🔑 default = false
}, { timestamps: true });

export default mongoose.model("Item", ItemSchema);
