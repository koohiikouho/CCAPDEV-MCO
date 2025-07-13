// File: models/labs.js
import mongoose from "mongoose";

const seatSchema = new mongoose.Schema({
  col: {
    type: String,
    required: true,
    uppercase: true,
    enum: ["A", "B", "C", "D", "E"],
  },
  row: {
    type: Number,
    required: true,
  },
  reservations: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reservations",
      default: [],
    },
  ],
});

const scheduleSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
  },
  opening: {
    type: String,
    required: false
  },
  closing: {
    type: String,
    required: false
  }
});

const labSchema = new mongoose.Schema(
  {
    lab_name: {
      type: String,
      required: true,
      trim: true,
    },
    lab_location: {
      building: {
        type: String,
        required: true,
        trim: true,
      },
      floor: {
        type: String,
        required: true,
        trim: true,
      },
      room: {
        type: Number,
        required: true,
      },
    },
    lab_description: {
      type: String,
      trim: true,
    },
    image: {
      alt: {
        type: String,
        trim: true,
      },
      src: {
        type: String,
        trim: true,
      },
      title: {
        type: String,
        trim: true,
      },
    },
    seats: {
      type: [seatSchema],
      required: true,
    },
    schedule: {
      type: [scheduleSchema],
      required: true
    }
  },
  {
    timestamps: true,
    collection: "Labs",
  }
);

labSchema.index({ "seats.col": 1, "seats.row": 1 }, { unique: true });

export default mongoose.model("Labs", labSchema);
