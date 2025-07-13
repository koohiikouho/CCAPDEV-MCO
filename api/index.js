import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Labs from "./models/labs.js";
import Users from "./models/users.js";
import Reservations from "./models/reservations.js";
import { idText } from "typescript";
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());


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

    // Format the response
    const formattedReservations = allReservations.map((reservation) => ({
      student: {
        name: reservation.user_id?.name
          ? `${reservation.user_id.name.first_name} ${reservation.user_id.name.last_name}`
          : "Unknown",
        email: reservation.user_id?.email || "N/A",
      },
      timeIn: reservation.time_in,
      timeOut: reservation.time_out,
      date: reservation.time_in.toISOString().split("T")[0],
      column: reservation.seat.col,
      row: reservation.seat.row,
      labName: reservation.lab_id?.lab_name || "N/A",
      status: reservation.status,
    }));

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
app.post('/users/login', async (req, res) => {
  console.log("---");
  console.log(`[${new Date().toLocaleTimeString()}] POST /users/login (Login attempt)`);

  try {
    console.log(`Looking up user with email: ${req.body.email}`);
    const user = await Users.findOne({ email: req.body.email }).exec();

    if (!user) {
      console.log("User not found.");
      return res.status(400).json({error: 'Wrong email or password'});
    }

    if (req.body.password === user.password) {
      console.log("Password matched");
      console.log("Successfully logged in.");

      // No expiration yet
      const accessToken = jwt.sign({
        id: user._id.toString(), // User OID to convert to string
      }, process.env.ACCESS_TOKEN_SECRET);
     res.json({
      accessToken: accessToken,
      user: {
        first_name: user.name.first_name,
        last_name: user.name.last_name,
        role: user.role
      }
    });
    } else {
      res.status(403).json({error: 'Wrong email or password'});
    }
  } catch (err) {
    console.error("!!! AN ERROR OCCURRED during login:", err);
    res.status(500).json({error: "Server error during login"});
  }
});

// Sign up function
app.post('/users/signup', async (req, res) => {
  console.log("---");
  console.log(`[${new Date().toLocaleTimeString()}] POST /users/signup (Signup attempt)`);

  const existingUser = await Users.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(409).json({ error: "Email already in use." });
    }
  try {
    const newUser = await Users.create({
      id_number: req.body.idNumber,
      name: {
        first_name: req.body.firstName,
        last_name: req.body.lastName
      },
      role: 'student',
      email: req.body.email,
      password: req.body.password,
      bio: ""
    });
    
    const accessToken = jwt.sign({
        id: newUser._id.toString(), // User OID to convert to string
    }, process.env.ACCESS_TOKEN_SECRET);
     res.json({accessToken: accessToken});

    console.log("New user created:", newUser.email);
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
})

// Used to fetch user info of current user
app.get('/users/me', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await Users.findById(decoded.id).exec();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user._id.toString(),
      id_number: user.id_number,
      first_name: user.name.first_name,
      last_name: user.name.last_name,
      email: user.email,
      avatar: user.avatar,
      role: user.role
    });
  } catch (err) {
    console.error("Token verification failed:", err);
    res.status(403).json({ error: 'Invalid token' });
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

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`labclub api listening on port ${port}`);
});
