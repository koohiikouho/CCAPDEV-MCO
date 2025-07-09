import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import Labs from "./models/labs.js";
import Users from "./models/users.js";
import Reservations from "./models/reservations.js";

const app = express();
const port = 3000;

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
    `[${new Date().toLocaleTimeString()}] Received a request for /labs/`
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

app.get("/reservations", async (req, res) => {
  console.log("---");
  console.log(`[${new Date().toLocaleTimeString()}] Received a request for /reservations`);

  try {
    console.log("Querying the database with Reservations.find() and populating...");
    const reservations = await Reservations.find()
      .populate("lab_id", "lab_name seats") // make sure seats are populated
      .populate("user_id", "email name avatar role");

    const formatted = reservations.map((r) => {
      let seat = "N/A";

      if (r.lab_id && r.lab_id.seats) {
        const matchedSeat = r.lab_id.seats.find((s) =>
          s.reservations.some(resId => resId.toString() === r._id.toString())
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

app.post("/login", async (req, res) => {
  console.log("---");
  console.log(`[${new Date().toLocaleTimeString()}] Received login request`);

  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      console.log("Login failed - missing credentials");
      return res.status(400).json({ message: "Please provide both email and password" });
    }

    console.log(`Attempting to find user with email: ${email}`);
    const currentUser = await user.findOne({ email }).select("+password");

    // Verify username
    if (!currentUser) {
      console.log("Login failed - user not found");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Verify password
    console.log("Verifying user matches password");
    const isMatch = await currentUser.comparePassword(password);
    
    if (!isMatch) {
      console.log("Login failed - password mismatch");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Create JWT token
    const token = currentUser.generateAuthToken();

    // Return user data (except password!!)
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      token
    };

    console.log(`User ${email} successfully authenticated`);
    res.status(200).json(userData);

  } catch (err) {
    console.error("!!! AN ERROR OCCURRED while fetching reservations:", err);
    res.status(500).json({ message: "Server error during authentication" });
  }
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`labclub api listening on port ${port}`);
});
