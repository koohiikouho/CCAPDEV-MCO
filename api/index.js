import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Labs from "./models/labs.js";
import Users from "./models/users.js";
import Reservations from "./models/reservations.js";
import Suggestions from "./models/suggestions.js";
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
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // Added PATCH
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

function authenticateJWT(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Token verification failed:", err);
    return res.status(403).json({ error: "Invalid token" });
  }
}

const mongoURI =
  "mongodb+srv://erozeroelectro:YkhFRSmwU9iOmWS1@apdev-mco.h5f8ux9.mongodb.net/LabReservation?retryWrites=true&w=majority&appName=APDEV-MCO";

mongoose
  .connect(mongoURI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB error:", err));

app.get("/labs", async (req, res) => {
  console.log("---");
  console.log(
    `[${new Date().toLocaleTimeString()}] Received a request for /labs`
  );
  try {
    console.log("Querying the database with Labs.find()...");
    const labs = await Labs.find().exec();
    console.log(`Database query finished. Found ${labs.length} documents.`);

    res.status(200).json(labs);
    console.log("Successfully sent JSON response.");
  } catch (err) {
    console.error("!!! AN ERROR OCCURRED while fetching labs:", err);
    res.status(500).send("Error fetching labs");
  }
});

app.get("/labs/:id", async (req, res) => {
  console.log("---");
  console.log(
    `[${new Date().toLocaleTimeString()}] Received a request for /labs/${req.params.id}`
  );

  try {
    const id = req.params.id;

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
    today.setHours(0, 0, 0, 0);

    const lab = await Labs.findById(labId).populate({
      path: "seats.reservations",
      match: {
        time_out: { $gte: today },
      },
      populate: [
        { path: "user_id", select: "name email id_number" },
        { path: "lab_id", select: "lab_name" },
      ],
    });

    if (!lab) {
      return res.status(404).json({ error: "Lab not found" });
    }

    const formatDateTime = (date) => {
      const d = new Date(date);
      return `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    };

    const formattedReservations = lab.seats.flatMap((seat) =>
      seat.reservations
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
  console.log("---");
  console.log(
    `[${new Date().toLocaleTimeString()}] Received a request for /labs/:id/:date/:timein/:timeout`
  );
  try {
    console.log("Querying the database with Labs.find()...");
    let labID = req.params.id;
    const labs = await Labs.find({
      _id: labID,
    }).exec();
    console.log(`Database query finished. Found ${labs.length} documents.`);

    res.status(200).json(labs);
    console.log("Successfully sent JSON response.");
  } catch (err) {
    console.error("!!! AN ERROR OCCURRED while fetching labs:", err);
    res.status(500).send("Error fetching labs");
  }
});

app.get("/users", async (req, res) => {
  console.log("---");
  console.log(
    `[${new Date().toLocaleTimeString()}] Received a request for /users`
  );
  try {
    console.log("Querying the database with Users.find()...");
    const users = await Users.find().exec();
    console.log(`Database query finished. Found ${users.length} documents.`);

    res.status(200).json(users);
    console.log("Successfully sent JSON response.");
  } catch (err) {
    console.error("!!! AN ERROR OCCURRED while fetching users:", err);
    res.status(500).send("Error fetching users");
  }
});

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

      const accessToken = jwt.sign(
        {
          id: user._id.toString(),
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

app.post("/users/signup", async (req, res) => {
  console.log("---");
  console.log(
    `[${new Date().toLocaleTimeString()}] POST /users/signup (Signup attempt)`
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

app.get("/lab-seats/:labId", async (req, res) => {
  try {
    const { labId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(labId)) {
      return res.status(400).json({ error: "Invalid lab ID format" });
    }

    const lab = await Labs.findById(labId).select("seats lab_name");

    if (!lab) {
      return res.status(404).json({ error: "Lab not found" });
    }

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

app.get("/users/me", async (req, res) => {
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

app.get("/available-seats/:labId", async (req, res) => {
  try {
    const { labId } = req.params;
    const { date, time_in, time_out, exclude_reservation } = req.query; // Added exclude_reservation

    if (!mongoose.Types.ObjectId.isValid(labId)) {
      return res.status(400).json({ error: "Invalid lab ID" });
    }

    const startDateTime = new Date(`${date}T${time_in}:00`);
    const endDateTime = new Date(`${date}T${time_out}:00`);

    console.log(
      `[DEBUG] Available seats query: lab=${labId}, exclude=${exclude_reservation}`
    );

    // Build match criteria for reservations
    const reservationMatch = {
      $or: [
        {
          time_in: { $lt: endDateTime },
          time_out: { $gt: startDateTime },
        },
      ],
    };

    // Exclude specific reservation if provided
    if (
      exclude_reservation &&
      mongoose.Types.ObjectId.isValid(exclude_reservation)
    ) {
      reservationMatch._id = {
        $ne: new mongoose.Types.ObjectId(exclude_reservation),
      };
      console.log(`[DEBUG] Excluding reservation: ${exclude_reservation}`);
    }

    const lab = await Labs.findById(labId).populate({
      path: "seats.reservations",
      match: reservationMatch,
    });

    if (!lab) {
      return res.status(404).json({ error: "Lab not found" });
    }

    const availableSeats = lab.seats.filter((seat) => {
      return !seat.reservations || seat.reservations.length === 0;
    });

    console.log(
      `[DEBUG] Found ${availableSeats.length} available seats out of ${lab.seats.length} total`
    );

    const response = {
      lab_id: labId,
      lab_name: lab.lab_name,
      date: date,
      time_in: time_in,
      time_out: time_out,
      excluded_reservation: exclude_reservation || null,
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
      .populate("lab_id", "lab_name seats")
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

// NEW ENDPOINT: Get user-specific reservations
app.get("/user-reservations", async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const userId = decoded.id;

    console.log(`[DEBUG] Fetching reservations for user: ${userId}`);

    const labs = await Labs.find()
      .populate({
        path: "seats.reservations",
        populate: {
          path: "user_id",
          select: "name email",
        },
      })
      .exec();

    const userReservations = [];

    labs.forEach((lab) => {
      lab.seats.forEach((seat) => {
        seat.reservations.forEach((reservation) => {
          if (
            reservation.user_id &&
            reservation.user_id._id.toString() === userId
          ) {
            console.log(
              `[DEBUG] Found reservation ${reservation._id} in seat ${seat.col}${seat.row}`
            );
            userReservations.push({
              _id: reservation._id,
              lab_id: {
                _id: lab._id,
                lab_name: lab.lab_name,
              },
              user_id: reservation.user_id,
              time_in: reservation.time_in,
              time_out: reservation.time_out,
              status: reservation.status,
              seat: `${seat.col}${seat.row}`,
              isAnonymous: reservation.isAnonymous,
              createdAt: reservation.createdAt,
              updatedAt: reservation.updatedAt,
            });
          }
        });
      });
    });

    console.log(`[DEBUG] Returning ${userReservations.length} reservations`);
    console.log(
      `[DEBUG] Sample reservation seats:`,
      userReservations.slice(0, 3).map((r) => ({ id: r._id, seat: r.seat }))
    );

    res.status(200).json(userReservations);
  } catch (err) {
    console.error("Error fetching user reservations:", err);
    res.status(500).json({
      error: "Error fetching user reservations",
      details: err.message,
    });
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

    if (
      !mongoose.Types.ObjectId.isValid(lab_id) ||
      !mongoose.Types.ObjectId.isValid(user_id)
    ) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const startDateTime = new Date(`${date}T${time_start}:00`);
    const endDateTime = new Date(startDateTime);
    endDateTime.setMinutes(endDateTime.getMinutes() + hours * 60);

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

    const lab = await Labs.findById(lab_id).session(session);

    if (!lab) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: "Lab not found" });
    }

    const daySchedule = lab.schedule.find((s) => s.day === reservationDay);
    if (!daySchedule || !daySchedule.opening || !daySchedule.closing) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        error: `Lab is closed on ${reservationDay}`,
        lab_schedule: lab.schedule,
      });
    }

    const [openingHour, openingMinute] = daySchedule.opening
      .split(":")
      .map(Number);
    const [closingHour, closingMinute] = daySchedule.closing
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
        error: "Reservation outside lab hours",
        details: {
          day: reservationDay,
          lab_hours: `${daySchedule.opening} - ${daySchedule.closing}`,
          requested_time: `${time_start} - ${endDateTime.toTimeString().slice(0, 5)}`,
        },
      });
    }

    const userExists = await Users.exists({ _id: user_id }).session(session);
    if (!userExists) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: "User not found" });
    }

    const seatMap = new Map();
    lab.seats.forEach((seat) => {
      seatMap.set(`${seat.col}${seat.row}`, seat);
    });

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

      const seatIndex = lab.seats.findIndex(
        (s) => s.col === seatDoc.col && s.row === seatDoc.row
      );

      if (seatIndex === -1) {
        throw new Error(`Seat ${position} not found in lab document`);
      }

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

app.patch("/reservations/:id", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid reservation ID");
    }

    const reservation = await Reservations.findById(id)
      .populate("lab_id")
      .session(session);
    if (!reservation) throw new Error("Reservation not found");

    const lab = reservation.lab_id;


    const {
      date,     
      time_start,   
      hours, 
      seats 
    } = req.body;

    let nextStart = reservation.time_in;
    let nextEnd   = reservation.time_out;
    if (date || time_start || hours) {
      if (!date || !time_start || !hours)
        throw new Error("date, time_start and hours must travel together");

      nextStart = new Date(`${date}T${time_start}:00`);
      nextEnd   = new Date(nextStart);
      nextEnd.setMinutes(nextEnd.getMinutes() + hours * 60);
    }

    const nextSeats = seats
      ? seats.map(s => s[0].toUpperCase() + s.slice(1))
      : null;

    if (["Completed", "Cancelled"].includes(reservation.status)) {
      throw new Error("Cannot edit a completed / cancelled reservation");
    }

    const conflicting = await Reservations.find({
      _id: { $ne: reservation._id },
      lab_id: lab._id,
      $or: [
        { time_in: { $lt: nextEnd }, time_out: { $gt: nextStart } }
      ]
    }).session(session);

    if (nextSeats) {
      const seatIdSet = new Set(nextSeats);
      for (const res of conflicting) {
        const seatHit = lab.seats.some(seat =>
          seatIdSet.has(`${seat.col}${seat.row}`) &&
          seat.reservations.some(rId => rId.equals(res._id))
        );
        if (seatHit) {
          throw new Error("Time conflict on one or more chosen seats");
        }
      }
    }

    if (nextSeats) {
      lab.seats.forEach(s => {
        s.reservations = s.reservations.filter(rId => !rId.equals(reservation._id));
      });
      lab.seats.forEach(s => {
        if (nextSeats.includes(`${s.col}${s.row}`)) {
          s.reservations.push(reservation._id);
        }
      });
    }

    reservation.time_in = nextStart;
    reservation.time_out = nextEnd;
    if (nextSeats) reservation.seat = nextSeats.join(",");

    await reservation.save({ session });
    await lab.save({ session });

    await session.commitTransaction();
    res.json({ message: "Reservation updated", reservation });
  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({ error: err.message });
  } finally {
    session.endSession();
  }
});


app.delete("/users/me", async (req, res) => {
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
      { role: "student" },
      {
        id_number: 1,
        "name.first_name": 1,
        "name.last_name": 1,
        _id: 0,
      }
    ).sort({ "name.last_name": 1 });

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
      user_id: id_number,
      lab_id,
      isAnonymous,
      seats,
    } = req.body;

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

    const user = await Users.findOne({ id_number }).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ error: "User not found with this ID number" });
    }

    const startDateTime = new Date(`${date}T${time_start}:00`);
    const endDateTime = new Date(startDateTime);
    endDateTime.setMinutes(endDateTime.getMinutes() + hours * 60);

    const lab = await Labs.findById(lab_id).session(session);
    if (!lab) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: "Lab not found" });
    }

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

    const createdReservations = [];
    for (const seatPos of seats) {
      const [col, rowStr] = [seatPos[0].toUpperCase(), seatPos.slice(1)];
      const row = parseInt(rowStr);

      const seat = lab.seats.find((s) => s.col === col && s.row === row);
      if (!seat) {
        await session.abortTransaction();
        session.endSession();
        return res
          .status(400)
          .json({ error: `Seat ${seatPos} not found in lab` });
      }

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

      const reservation = new Reservations({
        user_id: user._id,
        lab_id: lab._id,
        time_in: startDateTime,
        time_out: endDateTime,
        status: "Confirmed",
        isAnonymous,
      });

      await reservation.save({ session });

      seat.reservations.push(reservation._id);
      createdReservations.push(reservation);
    }

    await lab.save({ session });
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "Reservations created successfully",
      reservations: createdReservations.map((r, index) => ({
        id: r._id,
        student: {
          id_number: user.id_number,
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

// PUT /reservations/:id - Update reservation with proper transaction handling
app.put("/reservations/:id", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    console.log(
      `[DEBUG] Updating reservation ${req.params.id} with data:`,
      req.body
    );

    const { date, time_start, hours, lab_id, seats, isAnonymous } = req.body;
    const reservationId = req.params.id;

    // Validate required fields
    if (
      !date ||
      !time_start ||
      !hours ||
      !lab_id ||
      !seats ||
      !Array.isArray(seats) ||
      seats.length === 0
    ) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Find the existing reservation
    const existingReservation =
      await Reservations.findById(reservationId).session(session);
    if (!existingReservation) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: "Reservation not found" });
    }

    // Check if user owns this reservation
    if (existingReservation.user_id.toString() !== req.user.id) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(403)
        .json({ error: "Unauthorized to update this reservation" });
    }

    console.log(
      `[DEBUG] Found existing reservation in lab:`,
      existingReservation.lab_id
    );

    // Create new time objects
    const newStartTime = new Date(`${date}T${time_start}:00`);
    const newEndTime = new Date(
      newStartTime.getTime() + hours * 60 * 60 * 1000
    );
    const newSeat = seats[0];
    const newLabId = lab_id;

    console.log(
      `[DEBUG] Parsed values - newSeat: ${newSeat}, newLabId: ${newLabId}`
    );

    // Parse seat position
    const seatMatch = newSeat.match(/^([A-Z])(\d+)$/);
    if (!seatMatch) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: "Invalid seat format" });
    }

    const [, newCol, newRowStr] = seatMatch;
    const newRow = parseInt(newRowStr);

    console.log(
      `[DEBUG] Looking for seat col: ${newCol}, row: ${newRow} in lab ${newLabId}`
    );

    // Find current seat in old lab (since reservation doesn't store seat directly)
    const oldLab = await Labs.findById(existingReservation.lab_id).session(
      session
    );
    let currentSeat = null;
    let currentSeatIndex = -1;

    if (oldLab) {
      currentSeatIndex = oldLab.seats.findIndex((seat) =>
        seat.reservations.some((resId) => resId.toString() === reservationId)
      );

      if (currentSeatIndex !== -1) {
        currentSeat = `${oldLab.seats[currentSeatIndex].col}${oldLab.seats[currentSeatIndex].row}`;
        console.log(`[DEBUG] Found current seat: ${currentSeat}`);
      }
    }

    // Check if we're moving to a different lab or seat
    const isLabChange = existingReservation.lab_id.toString() !== newLabId;
    const isSeatChange = currentSeat !== newSeat;

    if (isLabChange || isSeatChange) {
      // Remove from old lab/seat first
      console.log(
        `[DEBUG] Removing reservation ${reservationId} from old lab seats`
      );

      if (oldLab && currentSeatIndex !== -1) {
        // Remove from old seat
        oldLab.seats[currentSeatIndex].reservations = oldLab.seats[
          currentSeatIndex
        ].reservations.filter((r) => r.toString() !== reservationId);
        await oldLab.save({ session });
        console.log(`[DEBUG] Removed reservation from old seat ${currentSeat}`);
      }
    }

    // Find target lab and seat
    const targetLab = await Labs.findById(newLabId).session(session);
    if (!targetLab) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: "Lab not found" });
    }

    // Find target seat using col and row
    const targetSeatIndex = targetLab.seats.findIndex(
      (s) => s.col === newCol && s.row === newRow
    );
    if (targetSeatIndex === -1) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ error: `Seat ${newSeat} not found in lab` });
    }

    console.log(
      `[DEBUG] Found target seat: ${newSeat} at index ${targetSeatIndex}`
    );

    // Check for conflicts (excluding current reservation)
    const conflictingReservations = await Reservations.find({
      _id: { $ne: reservationId },
      $or: [
        {
          time_in: { $lt: newEndTime },
          time_out: { $gt: newStartTime },
        },
      ],
      lab_id: newLabId,
      status: { $in: ["Confirmed", "Ongoing"] },
    }).session(session);

    // Check if any conflicting reservations are in the target seat
    const targetSeat = targetLab.seats[targetSeatIndex];
    const seatConflicts = conflictingReservations.filter((conflict) =>
      targetSeat.reservations.some(
        (resId) => resId.toString() === conflict._id.toString()
      )
    );

    if (seatConflicts.length > 0) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(409)
        .json({ error: "Seat is already reserved for the selected time" });
    }

    // Update the reservation
    existingReservation.time_in = newStartTime;
    existingReservation.time_out = newEndTime;
    existingReservation.lab_id = newLabId;
    existingReservation.isAnonymous = isAnonymous || false;

    await existingReservation.save({ session });
    console.log(`[DEBUG] Updated reservation document`);

    // Add to new seat if it changed
    if (isLabChange || isSeatChange) {
      if (
        !targetLab.seats[targetSeatIndex].reservations.includes(reservationId)
      ) {
        targetLab.seats[targetSeatIndex].reservations.push(reservationId);
        await targetLab.save({ session });
        console.log(`[DEBUG] Added reservation to new seat ${newSeat}`);
      }
    }

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    // Populate and return the updated reservation
    const updatedReservation = await Reservations.findById(reservationId)
      .populate("user_id", "first_name last_name email")
      .populate("lab_id", "lab_name");

    console.log(`[DEBUG] Successfully updated reservation ${reservationId}`);
    res.json(updatedReservation);
  } catch (error) {
    console.error("Error updating reservation:", error);
    await session.abortTransaction();
    session.endSession();

    if (error.name === "VersionError") {
      console.log("[DEBUG] Version conflict detected, retrying...");
      return res.status(409).json({
        error: "Update conflict detected. Please try again.",
        retryable: true,
      });
    }

    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/reservations/:reservationId", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { reservationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(reservationId)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: "Invalid reservation ID format" });
    }

    const reservation = await Reservations.findById(reservationId)
      .populate("lab_id")
      .session(session);

    if (!reservation) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: "Reservation not found" });
    }

    const lab = await Labs.findById(reservation.lab_id._id).session(session);

    if (!lab) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: "Associated lab not found" });
    }

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

    if (!mongoose.Types.ObjectId.isValid(labId)) {
      return res.status(400).json({ error: "Invalid lab ID format" });
    }

    const now = new Date();
    const tenMinutesFromNow = new Date(now.getTime() + 10 * 60000);

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

    const formattedReservations = [];

    for (const reservation of reservations) {
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

app.post("/users/suggestions", async (req, res) => {
  console.log("---");
  console.log(`[${new Date().toLocaleTimeString()}] POST /users/suggestions`);

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
