import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    lab_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "labs",
      required: true,
    },
    time_in: {
      type: Date,
      required: true,
    },
    time_out: {
      type: Date,
    },
    date: {
      type: Date,
      required: true,
    },
    seat: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "approved", "rejected"],
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
