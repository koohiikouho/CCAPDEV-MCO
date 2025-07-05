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
  console.log("---"); // Separator for requests
  console.log(
    `[${new Date().toLocaleTimeString()}] Received a request for /reservations`
  );
  try {
    console.log("Querying the database with Reservations.find()...");
    const reservations = await Reservations.find().exec();
    console.log(`Database query finished. Found ${reservations.length} documents.`);

    res.status(200).json(reservations);
    console.log("Successfully sent JSON response.");
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
