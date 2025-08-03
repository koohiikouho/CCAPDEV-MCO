import Labs from "./models/labs.js";
import Users from "./models/users.js";
import Reservations from "./models/reservations.js";
import multer from "multer";
import { Router } from "express";

const router = Router();

router.get("/reservations", async (req, res) => {
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

router.get("/students", async (req, res) => {
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

router.post("/reservations", async (req, res) => {
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

export default router;