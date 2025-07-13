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
    isAnonymous: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
    collection: "Reservations",
  }
);

reservationSchema.index(
  { user_id: 1, lab_id: 1, time_in: 1 },
  { unique: true }
);

export default mongoose.model("Reservations", reservationSchema);
