import Reservation from "../models/reservations.js";
import createError from "http-errors";
import { Router } from "express";

const router = Router();

export async function listReservationsByLab(req, res, next) {
  try {
    const { labId } = req.params;
    if (!mongoose.isValidObjectId(labId)) {
      throw createError(400, "Invalid labId");
    }

    const results = await Reservation.aggregate([
      { $match: { labId: new mongoose.Types.ObjectId(labId) } },

      /* join with Users collection to get the student's name */
      {
        $lookup: {
          from: "Users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },

      /* derive column & row from the seat string (e.g. "A3") */
      {
        $addFields: {
          column: { $substrCP: ["$seat", 0, 1] },
          row: { $toInt: { $substrCP: ["$seat", 1, 5] } },
        },
      },

      /* shape the final payload */
      {
        $project: {
          _id: 0,
          studentName: {
            $concat: ["$user.name.first_name", " ", "$user.name.last_name"],
          },
          timeIn: 1,
          timeOut: 1,
          date: 1,
          column: 1,
          row: 1,
        },
      },

      /* optional: sort by timeIn ascending */
      { $sort: { date: 1, timeIn: 1 } },
    ]);

    console.log("completed query");
    res.json(results);
  } catch (err) {
    next(err);
  }
}


// Fetch all reservation
router.get("/", async (req, res) => {
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


// Fetch reservation acc to labId
router.get("/:labId", async (req, res) => {
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


// Create a reservation
router.post("/", async (req, res) => {
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



// Update reservation
router.put("/reservationId", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  console.log(`Updating reservation ${req.params.id} with data:`, req.body);

  try {
    const { time_in, time_out, column, row } = req.body;
    const reservationId = req.params.reservationId;

    // Validate required fields
    if (!time_in || !time_out || !column || row === undefined) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Convert input to Date objects
    const newStartTime = new Date(time_in);
    const newEndTime = new Date(time_out);

    // Validate time_in and time_out are valid dates
    if (isNaN(newStartTime.getTime())) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: "Invalid time_in format" });
    }

    if (isNaN(newEndTime.getTime())) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: "Invalid time_out format" });
    }

    // Ensure minimum 30 minute duration
    const durationMinutes = (newEndTime - newStartTime) / (1000 * 60);
    if (durationMinutes < 30) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ error: "Minimum reservation duration is 30 minutes" });
    }

    // Round times to nearest 30 minutes
    const roundTo30Minutes = (date) => {
      const minutes = date.getMinutes();
      const roundedMinutes = minutes >= 30 ? 30 : 0;
      date.setMinutes(roundedMinutes, 0, 0);
      return date;
    };

    const roundedStartTime = roundTo30Minutes(new Date(newStartTime));
    const roundedEndTime = roundTo30Minutes(new Date(newEndTime));

    // Find the existing reservation
    const existingReservation =
      await Reservations.findById(reservationId).session(session);
    if (!existingReservation) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: "Reservation not found" });
    }

    // Get day of week (0=Sunday, 6=Saturday)
    const dayOfWeek = roundedStartTime.getDay();
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

    // Get lab with schedule
    const targetLab = await Labs.findById(existingReservation.lab_id).session(
      session
    );
    if (!targetLab) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: "Lab not found" });
    }

    // Check lab schedule for the day
    const daySchedule = targetLab.schedule.find(
      (s) => s.day === reservationDay
    );
    if (!daySchedule || !daySchedule.opening || !daySchedule.closing) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        error: `Lab is closed on ${reservationDay}`,
        lab_schedule: targetLab.schedule,
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
    const openingTime = new Date(roundedStartTime);
    openingTime.setHours(openingHour, openingMinute, 0, 0);

    const closingTime = new Date(roundedStartTime);
    closingTime.setHours(closingHour, closingMinute, 0, 0);

    // Validate against operating hours
    if (roundedStartTime < openingTime || roundedEndTime > closingTime) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        error: "Reservation outside lab hours",
        details: {
          day: reservationDay,
          lab_hours: `${daySchedule.opening} - ${daySchedule.closing}`,
          requested_time: `${roundedStartTime.toISOString()} - ${roundedEndTime.toISOString()}`,
        },
      });
    }

    // Validate seat position
    const newSeat = `${column}${row}`;
    if (!["A", "B", "C", "D", "E"].includes(column) || isNaN(row) || row <= 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: "Invalid seat position" });
    }

    // Find current seat in lab
    const currentSeatIndex = targetLab.seats.findIndex((seat) =>
      seat.reservations.some((resId) => resId.toString() === reservationId)
    );

    // Find target seat
    const targetSeatIndex = targetLab.seats.findIndex(
      (s) => s.col === column && s.row === row
    );
    if (targetSeatIndex === -1) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ error: `Seat ${newSeat} not found in lab` });
    }

    // Check if we're moving to a different seat
    const isSeatChange = currentSeatIndex !== targetSeatIndex;

    if (isSeatChange) {
      // Remove from old seat first
      if (currentSeatIndex !== -1) {
        targetLab.seats[currentSeatIndex].reservations = targetLab.seats[
          currentSeatIndex
        ].reservations.filter((r) => r.toString() !== reservationId);
      }
    }

    // Check for time conflicts (excluding current reservation)
    const conflictingReservations = await Reservations.find({
      _id: { $ne: reservationId },
      $or: [
        {
          time_in: { $lt: roundedEndTime },
          time_out: { $gt: roundedStartTime },
        },
      ],
      lab_id: existingReservation.lab_id,
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
      return res.status(409).json({
        error: "Seat is already reserved for the selected time",
        conflicting_times: seatConflicts.map((c) => ({
          from: c.time_in,
          to: c.time_out,
        })),
      });
    }

    // Update the reservation
    existingReservation.time_in = roundedStartTime;
    existingReservation.time_out = roundedEndTime;

    await existingReservation.save({ session });

    // Add to new seat if it changed
    if (isSeatChange) {
      if (
        !targetLab.seats[targetSeatIndex].reservations.includes(reservationId)
      ) {
        targetLab.seats[targetSeatIndex].reservations.push(reservationId);
      }
      await targetLab.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    // Populate and return the updated reservation
    const updatedReservation = await Reservations.findById(reservationId)
      .populate("user_id", "name email")
      .populate("lab_id", "lab_name");

    res.json({
      ...updatedReservation.toObject(),
      seat: newSeat,
      schedule_info: {
        day: reservationDay,
        opening_time: daySchedule.opening,
        closing_time: daySchedule.closing,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error updating reservation:", error);

    if (error.name === "VersionError") {
      return res.status(409).json({
        error: "Update conflict detected. Please try again.",
        retryable: true,
      });
    }

    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
});


// Delete reservation
router.delete("/reservationId", async (req, res) => {
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

router.get("/upcoming/:labId", async (req, res) => {
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

export default router;