// backend/routes/items.js
import express from "express";
import multer from "multer";
import path from "path";
import authMiddleware from "../middleware/auth.js";
import Item from "../models/Item.js";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import multerS3 from "multer-s3";

const router = express.Router();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
})

// // ✅ Multer setup for image upload
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/"); // make sure this folder exists
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname));
//   },
// });
const upload = multer({ 
  storage : multerS3({
    s3,
    bucket: process.env.AWS_UPLOADS_BUCKET,
    // acl: "public-read",
    key: (req,file,cb) =>{
      cb(null,Date.now().toString() + "-"+ file.originalname);
    },
  }),
 });


router.post("/", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const { title, description, category } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newItem = new Item({
      title,
      description,
      category,
      uploader: req.user.id,
      imageUrl: req.file.location,
      isApproved: false, // requires admin approval
    });

    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    console.error("Add Item Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @route   GET /api/items/approved
 * @desc    Get all approved items (for Browse)
 * @access  Public
 */
router.get("/approved", async (req, res) => {
  try {
    const items = await Item.find({ isApproved: true }).populate("uploader", "name email");
    res.json(items);
  } catch (err) {
    console.error("Fetch Approved Items Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @route   GET /api/items/my-items
 * @desc    Get all items uploaded by logged-in user
 * @access  Private
 */
router.get("/my-items", authMiddleware, async (req, res) => {
  try {
    const items = await Item.find({ uploader: req.user.id }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error("My Items Fetch Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @route   PUT /api/items/:id
 * @desc    Update item (only by owner)
 * @access  Private
 */
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const item = await Item.findById(req.params.id);

    if (!item) return res.status(404).json({ message: "Item not found" });
    if (item.uploader.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    item.title = title || item.title;
    item.description = description || item.description;
    item.category = category || item.category;

    await item.save();
    res.json(item);
  } catch (err) {
    console.error("Item Update Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @route   DELETE /api/items/:id
 * @desc    Delete item (only by owner)
 * @access  Private
 */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    if (item.uploader.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await item.deleteOne();
    res.json({ message: "Item deleted" });
  } catch (err) {
    console.error("Item Delete Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});




export default router;
