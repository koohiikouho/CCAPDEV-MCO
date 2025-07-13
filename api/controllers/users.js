import express from "express";
import upload from "../middlewares/upload.js";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

// Upload avatar route
router.post("/upload-avatar", upload.single("avatar"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const imageUrl = `${process.env.BASE_URL || "http://localhost:3000"}/uploads/${req.file.filename}`;
  res.status(200).json({ url: imageUrl });
});

export default router;
