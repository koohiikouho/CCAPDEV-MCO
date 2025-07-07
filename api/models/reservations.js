import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    lab_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Labs",
      required: true,
    },
    time_in: {
      type: Date,
      required: true,
    },
    time_out: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["Confirmed", "Ongoing", "Completed", "Cancelled"],
    },
  },
  {
    timestamps: true,
    collection: "Reservations",
  }
);

reservationSchema.index(
  { userId: 1, labId: 1, date: 1, timeIn: 1 },
  { unique: true }
);

export default mongoose.model("Reservations", reservationSchema);
