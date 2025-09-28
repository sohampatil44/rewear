// backend/models/Swap.js
import mongoose from "mongoose";

const swapSchema = new mongoose.Schema(
  {
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    toUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    itemRequested: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
    itemOffered: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
    status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
    isAdminApproved: { type: Boolean, default: false },
    pointsUsed: { type: Number, default: 10 } // ✅ new field
  },
  { timestamps: true }
);


export default mongoose.model("Swap", swapSchema);
