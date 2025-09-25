import mongoose from "mongoose";

const SwapSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String }, // base64 or image URL
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // relation to user
  },
  { timestamps: true }
);

export default mongoose.model("Swap", SwapSchema);
