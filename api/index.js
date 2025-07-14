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
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today

    // Get lab with populated reservations
    const lab = await Labs.findById(labId).populate({
      path: "seats.reservations",
      match: {
        time_out: { $gte: today }, // Only reservations that end today or later
      },
      populate: [
        { path: "user_id", select: "name email id_number" },
        { path: "lab_id", select: "lab_name" },
      ],
    });

    if (!lab) {
      return res.status(404).json({ error: "Lab not found" });
    }

    // Format date as MM-DD HH:MM
    const formatDateTime = (date) => {
      const d = new Date(date);
      return `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    };

    // Process all reservations
    const formattedReservations = lab.seats.flatMap((seat) =>
      seat.reservations
        // Additional filtering in case any old reservations slipped through
        .filter((reservation) => new Date(reservation.time_out) >= today)
        .map((reservation) => {
          const isAnonymous = reservation.isAnonymous;
          const user = reservation.user_id;

          return {
            reservation_id: reservation._id,
            user_id: user?._id,
            student: {
              id_number: isAnonymous ? null : user?.id_number,
              name: isAnonymous
                ? "Anonymous"
                : user?.name
                  ? `${user.name.first_name} ${user.name.last_name}`
                  : "Unknown",
              email: isAnonymous ? null : user?.email,
            },
            time_in: formatDateTime(reservation.time_in),
            time_out: formatDateTime(reservation.time_out),
            timestamp_in: reservation.time_in,
            timestamp_out: reservation.time_out,
            column: seat.col,
            row: seat.row,
            lab_name: reservation.lab_id?.lab_name || "N/A",
            status: reservation.status,
            is_anonymous: isAnonymous,
            created_at: reservation.createdAt,
            updated_at: reservation.updatedAt,
          };
        })
    );

    // Sort by time_in (earliest first)
    formattedReservations.sort((a, b) => a.timestamp_in - b.timestamp_in);

    res.status(200).json(formattedReservations);
  } catch (err) {
    console.error("Error fetching reservations:", err);
    res.status(500).json({
      error: "Error fetching reservations",
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
        isAnonymous: r.isAnonymous,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
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

    // Validate required fields
    if (
      !date ||
      !time_start ||
      !hours ||
      !user_id ||
      !lab_id ||
      !seats ||
      !seats.length
    ) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate ID formats
    if (
      !mongoose.Types.ObjectId.isValid(lab_id) ||
      !mongoose.Types.ObjectId.isValid(user_id)
    ) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: "Invalid ID format" });
    }

    // Calculate time range
    const startDateTime = new Date(`${date}T${time_start}:00`);
    const endDateTime = new Date(startDateTime);
    endDateTime.setMinutes(endDateTime.getMinutes() + hours * 60);

    // Get day of week (0=Sunday, 6=Saturday)
    const dayOfWeek = startDateTime.getDay();
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const reservationDay = days[dayOfWeek];

    // Get the full lab document with schedule
    const lab = await Labs.findById(lab_id).session(session);

    if (!lab) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: "Lab not found" });
    }

    // Check lab schedule for the day
    const daySchedule = lab.schedule.find((s) => s.day === reservationDay);
    if (!daySchedule || !daySchedule.opening || !daySchedule.closing) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        error: `Lab is closed on ${reservationDay}`,
        lab_schedule: lab.schedule,
      });
    }

    // Parse opening and closing times
    const [openingHour, openingMinute] = daySchedule.opening
      .split(":")
      .map(Number);
    const [closingHour, closingMinute] = daySchedule.closing
      .split(":")
      .map(Number);

    // Create Date objects for opening and closing times
    const openingTime = new Date(startDateTime);
    openingTime.setHours(openingHour, openingMinute, 0, 0);

    const closingTime = new Date(startDateTime);
    closingTime.setHours(closingHour, closingMinute, 0, 0);

    // Validate against operating hours
    if (startDateTime < openingTime || endDateTime > closingTime) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        error: "Reservation outside lab hours",
        details: {
          day: reservationDay,
          lab_hours: `${daySchedule.opening} - ${daySchedule.closing}`,
          requested_time: `${time_start} - ${endDateTime.toTimeString().slice(0, 5)}`,
        },
      });
    }

    // Validate user exists
    const userExists = await Users.exists({ _id: user_id }).session(session);
    if (!userExists) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: "User not found" });
    }

    // Create a map of all available seats
    const seatMap = new Map();
    lab.seats.forEach((seat) => {
      seatMap.set(`${seat.col}${seat.row}`, seat);
    });

    // Validate requested seats
    const invalidSeats = [];
    const validSeatData = [];

    seats.forEach((seatPos) => {
      const normalizedSeat = seatPos[0].toUpperCase() + seatPos.slice(1);
      if (seatMap.has(normalizedSeat)) {
        validSeatData.push({
          position: normalizedSeat,
          seatDoc: seatMap.get(normalizedSeat),
        });
      } else {
        invalidSeats.push(seatPos);
      }
    });

    if (invalidSeats.length > 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        error: "Some seats were not found",
        invalid_seats: invalidSeats,
        available_seats: Array.from(seatMap.keys()).sort(),
      });
    }

    // Check for time conflicts
    const conflictingReservations = await Reservations.find({
      lab_id,
      $or: [
        { time_in: { $lt: endDateTime }, time_out: { $gt: startDateTime } },
      ],
    }).session(session);

    const conflictingSeats = [];
    for (const { position, seatDoc } of validSeatData) {
      const hasConflict = conflictingReservations.some((res) =>
        seatDoc.reservations.some((resId) => resId.equals(res._id))
      );
      if (hasConflict) {
        conflictingSeats.push(position);
      }
    }

    if (conflictingSeats.length > 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(409).json({
        error: "Time conflict with existing reservations",
        conflicting_seats: conflictingSeats,
        conflicting_reservations: conflictingReservations.map((r) => ({
          time_in: r.time_in,
          time_out: r.time_out,
        })),
      });
    }

    // Create reservations and update seats
    const createdReservations = [];
    for (const { position, seatDoc } of validSeatData) {
      const reservation = new Reservations({
        user_id,
        lab_id,
        time_in: startDateTime,
        time_out: endDateTime,
        status: "Confirmed",
        isAnonymous,
      });

      await reservation.save({ session });

      // Find the specific seat in the lab's seats array
      const seatIndex = lab.seats.findIndex(
        (s) => s.col === seatDoc.col && s.row === seatDoc.row
      );

      if (seatIndex === -1) {
        throw new Error(`Seat ${position} not found in lab document`);
      }

      // Add the reservation to the correct seat
      lab.seats[seatIndex].reservations.push(reservation._id);
      createdReservations.push({
        id: reservation._id,
        seat: position,
        time_in: reservation.time_in,
        time_out: reservation.time_out,
        status: reservation.status,
        day: reservationDay,
        lab_hours: `${daySchedule.opening} - ${daySchedule.closing}`,
      });
    }

    // Save the updated lab document
    await lab.save({ session });
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "Reservations created successfully",
      reservations: createdReservations,
      schedule_info: {
        day: reservationDay,
        opening_time: daySchedule.opening,
        closing_time: daySchedule.closing,
      },
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

app.get("/admin/reservations", async (req, res) => {
  try {
    const reservations = await Reservations.find()
      .populate({
        path: "user_id",
        select: "name.first_name name.last_name",
      })
      .populate({
        path: "lab_id",
        select: "seats lab_name",
        populate: {
          path: "seats.reservations",
          model: "Reservations",
        },
      })
      .sort({ createdAt: -1 });

    const formattedReservations = reservations.map((reservation) => {
      let seatInfo = { col: "N/A", row: "N/A" };

      if (reservation.lab_id?.seats) {
        for (const seat of reservation.lab_id.seats) {
          if (
            seat.reservations.some((resId) => resId.equals(reservation._id))
          ) {
            seatInfo = { col: seat.col, row: seat.row };
            break;
          }
        }
      }

      return {
        reservation_id: reservation._id,
        student_name: reservation.isAnonymous
          ? "Anonymous"
          : `${reservation.user_id?.name?.first_name || ""} ${reservation.user_id?.name?.last_name || ""}`.trim() ||
            "Unknown",
        lab_name: reservation.lab_id?.lab_name || "Unknown Lab",
        time_in: reservation.time_in,
        time_out: reservation.time_out,
        created_at: reservation.createdAt,
        column: seatInfo.col,
        row: seatInfo.row,
        status: reservation.status,
        is_anonymous: reservation.isAnonymous,
      };
    });

    res.status(200).json(formattedReservations);
  } catch (err) {
    console.error("Error fetching reservations:", err);
    res.status(500).json({
      error: "Error fetching reservations",
      details: err.message,
    });
  }
});

app.get("/admin/students", async (req, res) => {
  try {
    const students = await Users.find(
      { role: "student" }, // Only get students
      {
        id_number: 1,
        "name.first_name": 1,
        "name.last_name": 1,
        _id: 0, // Exclude MongoDB's default _id
      }
    ).sort({ "name.last_name": 1 }); // Sort alphabetically by last name

    const formattedStudents = students.map((student) => ({
      id_number: student.id_number,
      full_name: `${student.name.first_name} ${student.name.last_name}`,
    }));

    res.status(200).json(formattedStudents);
  } catch (err) {
    console.error("Error fetching students:", err);
    res.status(500).json({
      error: "Error fetching student data",
      details: err.message,
    });
  }
});

app.post("/admin/reservations", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      date,
      time_start,
      hours,
      user_id: id_number, // Receiving ID number from request
      lab_id,
      isAnonymous,
      seats,
    } = req.body;

    // Validate inputs
    if (
      !date ||
      !time_start ||
      !hours ||
      !id_number ||
      !lab_id ||
      !seats ||
      !seats.length
    ) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Convert ID number to user ObjectId
    const user = await Users.findOne({ id_number }).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ error: "User not found with this ID number" });
    }

    // Calculate time range
    const startDateTime = new Date(`${date}T${time_start}:00`);
    const endDateTime = new Date(startDateTime);
    endDateTime.setMinutes(endDateTime.getMinutes() + hours * 60);

    // Get lab with seats
    const lab = await Labs.findById(lab_id).session(session);
    if (!lab) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: "Lab not found" });
    }

    // Check lab schedule
    const reservationDay = startDateTime.toLocaleDateString("en-US", {
      weekday: "long",
    });
    const labSchedule = lab.schedule.find((s) => s.day === reservationDay);

    if (!labSchedule || !labSchedule.opening || !labSchedule.closing) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ error: "Lab is closed on " + reservationDay });
    }

    // Validate against operating hours
    const [openingHour, openingMinute] = labSchedule.opening
      .split(":")
      .map(Number);
    const [closingHour, closingMinute] = labSchedule.closing
      .split(":")
      .map(Number);

    const openingTime = new Date(startDateTime);
    openingTime.setHours(openingHour, openingMinute, 0, 0);

    const closingTime = new Date(startDateTime);
    closingTime.setHours(closingHour, closingMinute, 0, 0);

    if (startDateTime < openingTime || endDateTime > closingTime) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        error: "Reservation time conflicts with lab hours",
        lab_hours: {
          day: reservationDay,
          opening: labSchedule.opening,
          closing: labSchedule.closing,
        },
        attempted_reservation: {
          start: time_start,
          end: endDateTime.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      });
    }

    // Process each seat reservation
    const createdReservations = [];
    for (const seatPos of seats) {
      const [col, rowStr] = [seatPos[0].toUpperCase(), seatPos.slice(1)];
      const row = parseInt(rowStr);

      // Find the seat in lab's seats array
      const seat = lab.seats.find((s) => s.col === col && s.row === row);
      if (!seat) {
        await session.abortTransaction();
        session.endSession();
        return res
          .status(400)
          .json({ error: `Seat ${seatPos} not found in lab` });
      }

      // Check for existing reservations in this seat
      const existingReservations = await Reservations.find({
        _id: { $in: seat.reservations },
        $or: [
          { time_in: { $lt: endDateTime }, time_out: { $gt: startDateTime } },
        ],
      }).session(session);

      if (existingReservations.length > 0) {
        await session.abortTransaction();
        session.endSession();
        return res.status(409).json({
          error: `Seat ${seatPos} already reserved`,
          conflicts: existingReservations.map((r) => ({
            from: r.time_in,
            to: r.time_out,
            status: r.status,
          })),
        });
      }

      // Create reservation (using user._id as required by schema)
      const reservation = new Reservations({
        user_id: user._id, // Using the ObjectId reference
        lab_id: lab._id,
        time_in: startDateTime,
        time_out: endDateTime,
        status: "Confirmed",
        isAnonymous,
      });

      await reservation.save({ session });

      // Update seat's reservations array
      seat.reservations.push(reservation._id);
      createdReservations.push(reservation);
    }

    // Save the lab with updated seat reservations
    await lab.save({ session });
    await session.commitTransaction();
    session.endSession();

    // Format response
    res.status(201).json({
      message: "Reservations created successfully",
      reservations: createdReservations.map((r, index) => ({
        id: r._id,
        student: {
          id_number: user.id_number, // Return original ID number
          name: isAnonymous
            ? "Anonymous"
            : `${user.name.first_name} ${user.name.last_name}`,
        },
        lab: lab.lab_name,
        seat: seats[index],
        time_in: r.time_in,
        time_out: r.time_out,
        status: r.status,
      })),
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error creating reservation:", err);
    res.status(500).json({
      error: "Error creating reservation",
      details: err.message,
    });
  }
});

app.put("/reservations/:reservationId", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { reservationId } = req.params;
    const { time_in, time_out, column, row } = req.body;

    // 1. Validate Inputs
    if (!time_in || !time_out || column === undefined || row === undefined) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: "All fields are required" });
    }

    // 2. Validate Seat Format
    const col = String(column).toUpperCase();
    const rowNum = Number(row);
    if (
      !["A", "B", "C", "D", "E"].includes(col) ||
      isNaN(rowNum) ||
      rowNum <= 0
    ) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ error: "Invalid seat format (e.g., A1, B2)" });
    }

    // 3. Find Reservation with Lab
    const reservation = await Reservations.findById(reservationId)
      .populate("lab_id")
      .session(session);
    if (!reservation) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: "Reservation not found" });
    }

    // 4. Get Lab with Seats
    const lab = await Labs.findById(reservation.lab_id._id)
      .select("seats schedule")
      .session(session);
    if (!lab) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: "Lab not found" });
    }

    // 5. Find New Seat
    const newSeat = lab.seats.find((s) => s.col === col && s.row === rowNum);
    if (!newSeat) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ error: `Seat ${col}${rowNum} not found in this lab` });
    }

    // 6. Convert and Validate Times
    const newStartTime = new Date(time_in);
    const newEndTime = new Date(time_out);
    if (newStartTime >= newEndTime) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ error: "End time must be after start time" });
    }

    // 7. Check Lab Hours
    const reservationDay = newStartTime.toLocaleDateString("en-US", {
      weekday: "long",
    });
    const labSchedule = lab.schedule.find((s) => s.day === reservationDay);
    if (!labSchedule?.opening || !labSchedule?.closing) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ error: `Lab is closed on ${reservationDay}` });
    }

    const [openHour, openMin] = labSchedule.opening.split(":").map(Number);
    const [closeHour, closeMin] = labSchedule.closing.split(":").map(Number);
    const openingTime = new Date(newStartTime);
    openingTime.setHours(openHour, openMin, 0, 0);
    const closingTime = new Date(newStartTime);
    closingTime.setHours(closeHour, closeMin, 0, 0);

    if (newStartTime < openingTime || newEndTime > closingTime) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        error: "Outside lab hours",
        lab_hours: `${labSchedule.opening} - ${labSchedule.closing}`,
      });
    }

    // 8. Check Seat Availability
    const conflicts = await Reservations.find({
      _id: { $ne: reservationId },
      lab_id: reservation.lab_id._id,
      $or: [{ time_in: { $lt: newEndTime }, time_out: { $gt: newStartTime } }],
    }).session(session);

    const seatConflicts = conflicts.filter((c) =>
      newSeat.reservations.some((resId) => resId.equals(c._id))
    );

    if (seatConflicts.length > 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(409).json({
        error: "Seat already reserved",
        conflicts: seatConflicts.map((c) => ({
          from: c.time_in,
          to: c.time_out,
        })),
      });
    }

    // 9. Find Current Seat and Remove Reference
    const currentSeat = lab.seats.find((s) =>
      s.reservations.some((resId) => resId.equals(reservationId))
    );
    if (currentSeat) {
      currentSeat.reservations = currentSeat.reservations.filter(
        (resId) => !resId.equals(reservationId)
      );
    }

    // 10. Update Reservation and Add to New Seat
    reservation.time_in = newStartTime;
    reservation.time_out = newEndTime;
    await reservation.save({ session });

    newSeat.reservations.push(reservation._id);
    await lab.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      message: "Reservation updated successfully",
      reservation: {
        id: reservation._id,
        lab: reservation.lab_id._id,
        seat: `${col}${rowNum}`,
        time_in: reservation.time_in,
        time_out: reservation.time_out,
        status: reservation.status,
      },
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("Update error:", err);
    return res.status(500).json({
      error: "Failed to update reservation",
      details: err.message,
    });
  }
});

app.delete("/reservations/:reservationId", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { reservationId } = req.params;

    // Validate reservation ID format
    if (!mongoose.Types.ObjectId.isValid(reservationId)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: "Invalid reservation ID format" });
    }

    // Find and populate the reservation with lab reference
    const reservation = await Reservations.findById(reservationId)
      .populate("lab_id")
      .session(session);

    if (!reservation) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: "Reservation not found" });
    }

    // Get the lab containing the reservation
    const lab = await Labs.findById(reservation.lab_id._id).session(session);

    if (!lab) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: "Associated lab not found" });
    }

    // Find and remove reservation reference from the seat
    let seatFound = false;
    for (const seat of lab.seats) {
      const reservationIndex = seat.reservations.findIndex((resId) =>
        resId.equals(reservationId)
      );

      if (reservationIndex !== -1) {
        seat.reservations.splice(reservationIndex, 1);
        seatFound = true;
        break;
      }
    }

    if (!seatFound) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ error: "Reservation not found in any seat" });
    }

    // Save the updated lab and delete the reservation
    await lab.save({ session });
    await Reservations.deleteOne({ _id: reservationId }).session(session);

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: "Reservation deleted successfully",
      deleted_reservation: {
        id: reservation._id,
        lab_id: reservation.lab_id._id,
        time_in: reservation.time_in,
        time_out: reservation.time_out,
        status: reservation.status,
      },
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error deleting reservation:", err);
    res.status(500).json({
      error: "Error deleting reservation",
      details: err.message,
    });
  }
});

app.get("/reservations/upcoming/:labId", async (req, res) => {
  try {
    const { labId } = req.params;

    // Validate lab ID
    if (!mongoose.Types.ObjectId.isValid(labId)) {
      return res.status(400).json({ error: "Invalid lab ID format" });
    }

    // Calculate time range
    const now = new Date();
    const tenMinutesFromNow = new Date(now.getTime() + 10 * 60000);

    // Find upcoming reservations
    const reservations = await Reservations.find({
      lab_id: labId,
      time_in: {
        $gte: now,
        $lte: tenMinutesFromNow,
      },
    })
      .populate({
        path: "user_id",
        select: "name.first_name name.last_name",
      })
      .populate({
        path: "lab_id",
        select: "seats",
        populate: {
          path: "seats.reservations",
          match: {
            time_in: {
              $gte: now,
              $lte: tenMinutesFromNow,
            },
          },
        },
      });

    // Format response
    const formattedReservations = [];

    for (const reservation of reservations) {
      // Find which seat this reservation belongs to
      const lab = await Labs.findById(labId)
        .select("seats")
        .populate({
          path: "seats.reservations",
          match: { _id: reservation._id },
        });

      if (!lab) continue;

      for (const seat of lab.seats) {
        if (seat.reservations.length > 0) {
          formattedReservations.push({
            reservation_id: reservation._id,
            seat: `${seat.col}${seat.row}`,
            time_start: reservation.time_in,
            student_name: reservation.isAnonymous
              ? "Anonymous"
              : `${reservation.user_id?.name?.first_name || ""} ${reservation.user_id?.name?.last_name || ""}`.trim(),
          });
          break;
        }
      }
    }

    res.status(200).json({
      count: formattedReservations.length,
      upcoming_reservations: formattedReservations,
    });
  } catch (err) {
    console.error("Error fetching upcoming reservations:", err);
    res.status(500).json({
      error: "Error fetching upcoming reservations",
      details: err.message,
    });
  }
});
