import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  labId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "labs",
    required: true,
  },
  timeIn: {
    type: Date,
    required: true,
  },
  timeOut: {
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
}, {
  timestamps: true,
  collection: "Reservations",
});

reservationSchema.index({ userId: 1, labId: 1, date: 1, timeIn: 1 }, { unique: true });

export default mongoose.model("reservation", reservationSchema);