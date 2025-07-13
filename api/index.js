import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Labs from "./models/labs.js";
import Users from "./models/users.js";
import Reservations from "./models/reservations.js";
import { idText } from "typescript";
import dotenv from "dotenv";
import path from "path";
import userUploadRoutes from "./controllers/users.js";

import bodyParser from "body-parser";

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const mongoURI =
  "mongodb+srv://erozeroelectro:YkhFRSmwU9iOmWS1@apdev-mco.h5f8ux9.mongodb.net/LabReservation?retryWrites=true&w=majority&appName=APDEV-MCO";

mongoose
  .connect(mongoURI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB error:", err));

app.get("/labs", async (req, res) => {
  console.log("---"); // Separator for requests
  console.log(
    `[${new Date().toLocaleTimeString()}] Received a request for /labs`
  );
  try {
    console.log("Querying the database with Labs.find()...");
    const labs = await Labs.find().exec();
    console.log(`Database query finished. Found ${labs.length} documents.`); // This tells us if the query worked and how much data it found.

    res.status(200).json(labs);
    console.log("Successfully sent JSON response.");
  } catch (err) {
    console.error("!!! AN ERROR OCCURRED while fetching labs:", err); // This will print the full error object
    res.status(500).send("Error fetching labs");
  }
});

app.get("/labs/:id", async (req, res) => {
  console.log("---"); // Separator for requests
  console.log(
    `[${new Date().toLocaleTimeString()}] Received a request for /labs/${req.params.id}`
  );

  try {
    const id = req.params.id;

    // Validate the ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid lab ID format" });
    }

    console.log("Querying the database with Labs.findById()...");
    const lab = await Labs.findById(id).exec();

    if (!lab) {
      console.log("No lab found with that ID");
      return res.status(404).json({ error: "Lab not found" });
    }

    console.log("Database query finished. Lab found:", lab.lab_name);
    res.status(200).json(lab);
    console.log("Successfully sent JSON response.");
  } catch (err) {
    console.error("!!! AN ERROR OCCURRED while fetching lab:", err);
    res.status(500).json({
      error: "Error fetching lab",
      details: err.message,
    });
  }
});

app.get("/reservations/:labId", async (req, res) => {
  try {
    const labId = req.params.labId;

    // First get the lab with all seats and their reservations populated
    const lab = await Labs.findById(labId).populate({
      path: "seats.reservations",
      populate: [
        { path: "user_id", select: "name email" },
        { path: "lab_id", select: "lab_name" },
      ],
    });

    if (!lab) {
      return res.status(404).json({ error: "Lab not found" });
    }

    // Helper function to format dates as MM-DD-HH:Minute
    const formatDateTime = (date) => {
      const d = new Date(date);
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const hours = String(d.getHours()).padStart(2, "0");
      const minutes = String(d.getMinutes()).padStart(2, "0");
      return `${month}-${day} ${hours}:${minutes}`;
    };

    // Extract all reservations from all seats
    const allReservations = [];

    lab.seats.forEach((seat) => {
      seat.reservations.forEach((reservation) => {
        allReservations.push({
          ...reservation.toObject(),
          seat: {
            col: seat.col,
            row: seat.row,
          },
        });
      });
    });

    // Format the response with snake_case
    const formattedReservations = allReservations.map((reservation) => {
      const isAnonymous = reservation.isAnonymous;

      return {
        user_id: isAnonymous
          ? null
          : reservation.user_id?._id?.toString() || null,
        student: {
          name: isAnonymous
            ? "Anonymous"
            : reservation.user_id?.name
              ? `${reservation.user_id.name.first_name} ${reservation.user_id.name.last_name}`
              : "Unknown",
          email: isAnonymous ? "N/A" : reservation.user_id?.email || "N/A",
        },
        time_in: formatDateTime(reservation.time_in),
        time_out: formatDateTime(reservation.time_out),
        column: reservation.seat.col,
        row: reservation.seat.row,
        lab_name: reservation.lab_id?.lab_name || "N/A",
        status: reservation.status,
        is_anonymous: isAnonymous,
      };
    });

    res.status(200).json(formattedReservations);
  } catch (err) {
    console.error("Error fetching lab reservations:", err);
    res.status(500).json({
      error: "Error fetching lab reservations",
      details: err.message,
    });
  }
});

/* simple error handler */
app.use((err, req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message });
});

app.get("/labs/:id/:date/:timein/:timeout", async (req, res) => {
  console.log("---"); // Separator for requests
  console.log(
    `[${new Date().toLocaleTimeString()}] Received a request for /labs/:id/:date/:timein/:timeout`
  );
  try {
    console.log("Querying the database with Labs.find()...");
    let labID = req.params.id;
    const labs = await Labs.find({
      _id: labID,
    }).exec();
    console.log(`Database query finished. Found ${labs.length} documents.`); // This tells us if the query worked and how much data it found.

    res.status(200).json(labs);
    console.log("Successfully sent JSON response.");
  } catch (err) {
    console.error("!!! AN ERROR OCCURRED while fetching labs:", err); // This will print the full error object
    res.status(500).send("Error fetching labs");
  }
});

app.get("/users", async (req, res) => {
  console.log("---"); // Separator for requests
  console.log(
    `[${new Date().toLocaleTimeString()}] Received a request for /users`
  );
  try {
    console.log("Querying the database with Users.find()...");
    const users = await Users.find().exec();
    console.log(`Database query finished. Found ${users.length} documents.`); // This tells us if the query worked and how much data it found.

    res.status(200).json(users);
    console.log("Successfully sent JSON response.");
  } catch (err) {
    console.error("!!! AN ERROR OCCURRED while fetching users:", err); // This will print the full error object
    res.status(500).send("Error fetching users");
  }
});

// Used to verify login credentials w/ db
app.post("/users/login", async (req, res) => {
  console.log("---");
  console.log(
    `[${new Date().toLocaleTimeString()}] POST /users/login (Login attempt)`
  );

  try {
    console.log(`Looking up user with email: ${req.body.email}`);
    const user = await Users.findOne({ email: req.body.email }).exec();

    if (!user) {
      console.log("User not found.");
      return res.status(400).json({ error: "Wrong email or password" });
    }

    if (req.body.password === user.password) {
      console.log("Password matched");
      console.log("Successfully logged in.");

      // No expiration yet
      const accessToken = jwt.sign(
        {
          id: user._id.toString(), // User OID to convert to string
        },
        process.env.ACCESS_TOKEN_SECRET
      );
      res.json({
        accessToken: accessToken,
        user: {
          first_name: user.name.first_name,
          last_name: user.name.last_name,
          role: user.role,
        },
      });
    } else {
      res.status(403).json({ error: "Wrong email or password" });
    }
  } catch (err) {
    console.error("!!! AN ERROR OCCURRED during login:", err);
    res.status(500).json({ error: "Server error during login" });
  }
});

// Sign up function
app.post("/users/signup", async (req, res) => {
  console.log("---");
  console.log(
    `[${new Date().toLocaleTimeString()}] POST /users/signup (Signup attempt)`
  );

  const existingUser = await Users.findOne({ email: req.body.email });
  if (existingUser) {
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
        id: newUser._id.toString(), // User OID to convert to string
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

app.get("/lab-seats/:labId", async (req, res) => {
  try {
    const { labId } = req.params;

    // Validate lab ID
    if (!mongoose.Types.ObjectId.isValid(labId)) {
      return res.status(400).json({ error: "Invalid lab ID format" });
    }

    // Find the lab and select only the seats
    const lab = await Labs.findById(labId).select("seats lab_name");

    if (!lab) {
      return res.status(404).json({ error: "Lab not found" });
    }

    // Format the seats into the required {value, name} pairs
    const formattedSeats = lab.seats.map((seat) => ({
      value: `${seat.col}${seat.row}`,
      name: `${seat.col}${seat.row}`,
    }));

    res.status(200).json({
      lab_id: labId,
      lab_name: lab.lab_name,
      seats: formattedSeats,
      total_seats: formattedSeats.length,
    });
  } catch (err) {
    console.error("Error fetching lab seats:", err);
    res.status(500).json({
      error: "Server error while fetching seats",
      details: err.message,
    });
  }
});

// Used to fetch user info of current user
app.get("/users/me", async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer

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

app.get("/available-seats/:labId", async (req, res) => {
  try {
    const { labId } = req.params;
    const { date, time_in, time_out } = req.query;

    // Validate inputs
    if (!mongoose.Types.ObjectId.isValid(labId)) {
      return res.status(400).json({ error: "Invalid lab ID" });
    }

    // Create full datetime objects
    const startDateTime = new Date(`${date}T${time_in}:00`);
    const endDateTime = new Date(`${date}T${time_out}:00`);

    // 1. Get the lab with all seats and their reservations populated
    const lab = await Labs.findById(labId).populate({
      path: "seats.reservations",
      match: {
        $or: [
          {
            time_in: { $lt: endDateTime },
            time_out: { $gt: startDateTime },
          },
        ],
      },
    });

    if (!lab) {
      return res.status(404).json({ error: "Lab not found" });
    }

    // 2. Find available seats (seats with no conflicting reservations)
    const availableSeats = lab.seats.filter((seat) => {
      // A seat is available if either:
      // - It has no reservations at all, or
      // - None of its reservations conflict with our time range
      return !seat.reservations || seat.reservations.length === 0;
    });

    // 3. Format response
    const response = {
      lab_id: labId,
      lab_name: lab.lab_name,
      date: date,
      time_in: time_in,
      time_out: time_out,
      available_seats: availableSeats.map((seat) => ({
        seat_id: seat._id,
        position: `${seat.col}${seat.row}`,
        column: seat.col,
        row: seat.row,
      })),
      total_available: availableSeats.length,
      total_seats: lab.seats.length,
    };

    res.status(200).json(response);
  } catch (err) {
    console.error("Error finding available seats:", err);
    res.status(500).json({
      error: "Server error",
      details: err.message,
    });
  }
});

app.get("/reservations", async (req, res) => {
  console.log("---");
  console.log(
    `[${new Date().toLocaleTimeString()}] Received a request for /reservations`
  );

  try {
    console.log(
      "Querying the database with Reservations.find() and populating..."
    );
    const reservations = await Reservations.find()
      .populate("lab_id", "lab_name seats") // make sure seats are populated
      .populate("user_id", "email name avatar role");

    const formatted = reservations.map((r) => {
      let seat = "N/A";

      if (r.lab_id && r.lab_id.seats) {
        const matchedSeat = r.lab_id.seats.find((s) =>
          s.reservations.some((resId) => resId.toString() === r._id.toString())
        );

        if (matchedSeat) {
          seat = `${matchedSeat.col}${matchedSeat.row}`;
        }
      }

      return {
        _id: r._id,
        lab_id: r.lab_id,
        user_id: r.user_id,
        time_in: r.time_in,
        time_out: r.time_out,
        status: r.status,
        seat: seat,
      };
    });

    res.status(200).json(formatted);
  } catch (err) {
    console.error("!!! AN ERROR OCCURRED while fetching reservations:", err);
    res.status(500).send("Error fetching reservations");
  }
});

app.post("/reservations", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      date,
      time_start,
      hours,
      user_id,
      lab_id,
      isAnonymous = false,
      seats,
    } = req.body;

    // [Keep all your existing validation code]

    const startDateTime = new Date(`${date}T${time_start}:00`);
    const endDateTime = new Date(startDateTime);
    endDateTime.setMinutes(endDateTime.getMinutes() + hours * 60);

    const lab = await Labs.findById(lab_id).session(session);
    if (!lab) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: "Lab not found" });
    }

    // Process reservations sequentially instead of in parallel
    const createdReservations = [];
    for (const seatPos of seats) {
      const [col, rowStr] = [seatPos[0].toUpperCase(), seatPos.slice(1)];
      const row = parseInt(rowStr);

      // [Keep your existing seat validation code]

      const seat = lab.seats.find((s) => s.col === col && s.row === row);
      if (!seat) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ error: `Seat ${seatPos} not found` });
      }

      // Check for conflicts
      const conflicting = await Reservations.find({
        _id: { $in: seat.reservations },
        $or: [
          { time_in: { $lt: endDateTime }, time_out: { $gt: startDateTime } },
        ],
      }).session(session);

      if (conflicting.length > 0) {
        await session.abortTransaction();
        session.endSession();
        return res.status(409).json({
          error: `Seat ${seatPos} already reserved`,
          conflicting_times: conflicting.map((c) => ({
            from: c.time_in,
            to: c.time_out,
          })),
        });
      }

      // Create and save reservation
      const reservation = new Reservations({
        user_id,
        lab_id,
        time_in: startDateTime,
        time_out: endDateTime,
        status: "Confirmed",
        isAnonymous,
      });

      await reservation.save({ session });
      seat.reservations.push(reservation._id);
      createdReservations.push(reservation);
    }

    // Save the lab once with all updates
    await lab.save({ session });
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "Reservations created successfully",
      reservations: createdReservations.map((r, i) => ({
        id: r._id,
        seat: seats[i],
        time_in: r.time_in,
        time_out: r.time_out,
        status: r.status,
      })),
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error creating reservations:", err);
    res.status(500).json({
      error: "Error creating reservations",
      details: err.message,
    });
  }
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`labclub api listening on port ${port}`);
});

app.put("/users/me", async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const updates = req.body;

    const allowedFields = ["name", "bio", "avatar"];
    const updateData = {};

    // Filter only the allowed fields to update
    for (const key of allowedFields) {
      if (updates[key]) {
        updateData[key] = updates[key];
      }
    }

    // Handle name as string → split to first and last name if needed
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

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/users", userUploadRoutes);
