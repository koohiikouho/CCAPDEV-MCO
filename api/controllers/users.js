import Users from "../models/users.js";
import { Router } from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";

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

// Fetches all users
router.get("/", async (req, res) => {
  try {
    const users = await Users.find().exec();

    res.status(200).json(users);
    
  } catch (err) {
    res.status(500).send("Error fetching users");
  }
});


// User login
router.post("/login", async (req, res) => {

  try {
    const user = await Users.findOne({ email: req.body.email }).exec();

    if (!user) {
      console.log("User not found.");
      return res.status(400).json({ error: "Wrong email or password" });
    }

    if (await user.comparePassword(req.body.password)) {
      const accessToken = jwt.sign(
        {
          id: user._id.toString(),
          firstName: user.name.first_name,
          lastName: user.name.last_name,
          role: user.role,
          avatar: user.avatar,
          email: user.email,
          bio: user.bio
        },
        process.env.ACCESS_TOKEN_SECRET
      );

      res.json({
        accessToken: accessToken,
      });
    } else {
      res.status(403).json({ error: "Wrong email or password" });
    }
  } catch (err) {
    console.error("!!! AN ERROR OCCURRED during login:", err);
    res.status(500).json({ error: "Server error during login" });
  }
});


// User signup
router.post("/signup", async (req, res) => {
  console.log("---");
  console.log(
    `[${new Date().toLocaleTimeString()}] POST /user/signup (Signup attempt)`
  );

  const existingID = await Users.findOne({ id_number: req.body.idNumber });
  if (existingID) {
    console.log("!! ID number is already in use");
    return res.status(409).json({ error: "ID number already in use." });
  }

  const existingEmail = await Users.findOne({ email: req.body.email });
  if (existingEmail) {
    console.log("!! Email is already in use");
    return res.status(409).json({ error: "Email already in use." });
  }

  try {
    const fullName = `${req.body.firstName} ${req.body.lastName}`;
    const newUser = await Users.create({
      id_number: req.body.idNumber,
      name: {
        first_name: req.body.firstName,
        last_name: req.body.lastName,
      },
      role: "student",
      email: req.body.email,
      password: req.body.password,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=3b82f6&color=fff`,
      bio: "",
    });

    const accessToken = jwt.sign(
      {
        id: newUser._id.toString(),
      },
      process.env.ACCESS_TOKEN_SECRET
    );
    res.json({ accessToken: accessToken });

    console.log("New user created:", newUser.email);
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
});


// Sending suggestions
router.post("/suggestions", async (req, res) => {
  console.log("---");
  console.log(`[${new Date().toLocaleTimeString()}] POST /user/suggestions`);

  try {
    const newSuggestion = await Suggestions.create({
      email: req.body.email,
      subject: req.body.subject,
      message: req.body.message,
    });
    console.log("New suggestion sent:");
    res.status(201).json({ message: "Suggestion submitted successfully." });
  } catch (err) {
    console.error("Suggestion error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
});


// Fetching user info from user in jwt
router.get("/me", async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await Users.findById(decoded.id).exec();

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      id: user._id.toString(),
      id_number: user.id_number,
      first_name: user.name.first_name,
      last_name: user.name.last_name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      bio: user.bio,
    });
  } catch (err) {
    console.error("Token verification failed:", err);
    res.status(403).json({ error: "Invalid token" });
  }
});


// Updates user info
router.put("/me", async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const updates = req.body;

    const allowedFields = ["name", "bio", "avatar"];
    const updateData = {};

    for (const key of allowedFields) {
      if (updates[key]) {
        updateData[key] = updates[key];
      }
    }

    if (updateData.name && typeof updateData.name === "string") {
      const parts = updateData.name.trim().split(" ");
      updateData.name = {
        first_name: parts[0],
        last_name: parts.slice(1).join(" ") || "",
      };
    }

    const updatedUser = await Users.findByIdAndUpdate(
      decoded.id,
      { $set: updateData },
      { new: true }
    );

    if (!updatedUser) return res.status(404).json({ error: "User not found" });

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        bio: updatedUser.bio,
        avatar: updatedUser.avatar,
        role: updatedUser.role,
      },
    });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
});


// Deletes user
router.delete("/me", async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const userId = decoded.id;
    const { password } = req.body;

    const user = await Users.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (password !== user.password) {
      return res
        .status(401)
        .json({ message: "Incorrect password. Please try again." });
    }

    await Users.findByIdAndDelete(userId);
    console.log(`User ${user.email} deleted.`);
    res.status(204).send();
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


// Upload avatar
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
