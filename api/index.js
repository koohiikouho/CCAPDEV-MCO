import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import bodyParser from "body-parser";
import { isAuthenticated } from './middlewares/auth.js';

import Labs from "./models/labs.js";
import Users from "./models/users.js";
import Reservations from "./models/reservations.js";
import Suggestions from "./models/suggestions.js";

import userRoutes from "./controllers/users.js";
import reservationRoutes from "./controllers/reservation.js";
import labRoutes from "./controllers/labs.js";

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // Added PATCH
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// DB Connection
const mongoURI = process.env.DB_URL;

mongoose
  .connect(mongoURI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB error:", err));

// User routes
app.use('/users', userRoutes);

// Reservation routes
app.use('/reservations', reservationRoutes);

// Lab routes
app.use('/', labRoutes);

// Admin routes
app.use('/', isAuthenticated('Admin'), labRoutes);

// Simple error handler
app.use((err, req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message });
});

// Tester
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`labclub api listening on port ${port}`);
});

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/suggestions", async (req, res) => {
  console.log("---");
  console.log(
    `[${new Date().toLocaleTimeString()}] Received a request for /suggestions`
  );
  try {
    console.log("Querying the database with Suggestions.find()...");
    const suggestions = await Suggestions.find().exec();
    console.log(
      `Database query finished. Found ${suggestions.length} documents.`
    );

    res.status(200).json(suggestions);
    console.log("Successfully sent JSON response.");
  } catch (err) {
    console.error("!!! AN ERROR OCCURRED while fetching suggestions:", err);
    res.status(500).send("Error fetching suggestions");
  }
});