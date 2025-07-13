import { Router } from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

const router = Router();

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up multer-storage-cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "profile_pics", // folder in your Cloudinary account
    allowed_formats: ["jpg", "jpeg", "png"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  },
});

const parser = multer({ storage });

router.post("/upload-avatar", parser.single("avatar"), (req, res) => {
  try {
    if (!req.file) {
      console.log("Upload failed: no file");
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("Uploaded file:", req.file);
    res.status(200).json({ url: req.file.path });
  } catch (err) {
    console.error("Upload server error:", err);
    res.status(500).json({ error: "Upload failed", details: err.message });
  }
});

export default router;
