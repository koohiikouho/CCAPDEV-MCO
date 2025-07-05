import mongoose from "mongoose";
import Reservation from "../models/reservations.js"; // your Reservation model
import createError from "http-errors";

/**
 * GET /labs/:labId/reservations
 *
 * Returns [{ studentName, timeIn, timeOut, date, column, row }, …]
 */
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
