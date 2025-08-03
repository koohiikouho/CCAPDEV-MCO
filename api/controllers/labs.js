import Labs from "../models/labs.js";
import mongoose from "mongoose";
import { Router } from "express";
import { isAuthenticated } from '../middlewares/auth.js';
import { errorDatabaseLogger } from "../middlewares/logger.js";

const router = Router();

// Fetch all labs
router.get("/labs", isAuthenticated('student'), async (req, res) => {
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
    errorDatabaseLogger(`Lab fetch error`, err);
    res.status(500).send("Error fetching labs");
  }
});


// Fetch lab by id
router.get("/labs/:id", isAuthenticated('student'), async (req, res) => {
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
    errorDatabaseLogger(`Lab ${id} fetch error`, err);
    res.status(500).json({
      error: "Error fetching lab",
      details: err.message,
    });
  }
});


// Fetch lab w/ these parameters
router.get("/labs/:id/:date/:timein/:timeout", async (req, res) => {
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
    errorDatabaseLogger(`Lab ${id} reservation fetch error`, err);
    res.status(500).send("Error fetching labs");
  }
});

router.get("/lab-seats/:labId", isAuthenticated('student'), async (req, res) => {
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
    errorDatabaseLogger(`Error fetching lab seats`, err);
    res.status(500).json({
      error: "Server error while fetching seats",
      details: err.message,
    });
  }
});

router.get("/available-seats/:labId", async (req, res) => {
  try {
    const { labId } = req.params;
    const { date, time_in, time_out, exclude_reservation } = req.query; // Added exclude_reservation

    if (!mongoose.Types.ObjectId.isValid(labId)) {
      return res.status(400).json({ error: "Invalid lab ID" });
    }

    const startDateTime = new Date(`${date}T${time_in}:00`);
    const endDateTime = new Date(`${date}T${time_out}:00`);

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
    errorDatabaseLogger(`Available seats at lab ${labId} fetch error`, err);
    res.status(500).json({
      error: "Server error",
      details: err.message,
    });
  }
});

export default router;