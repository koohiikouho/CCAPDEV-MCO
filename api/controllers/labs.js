import Labs from "../models/labs.js";
import { Router } from "express";
import { isAuthenticated } from '../middlewares/auth.js';


const router = Router();

// Fetch all labs
router.get("/", isAuthenticated('student'), async (req, res) => {
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
    res.status(500).json({
      error: "Server error while fetching seats",
      details: err.message,
    });
  }
});



export default router;