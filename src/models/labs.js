const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  col: {
    type: String,
    required: true,
    uppercase: true,
    enum: ['A', 'B', 'C', 'D', 'E'] // E is our highest column code for now
  },
  row: {
    type: Number,
    required: true,
  },
  reservations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'reservations',
    default: []
  }]
})

const labSchema = new mongoose.Schema({
  labName: {
    type: String,
    required: true,
    trim: true
  },
  labLocation: {
    building: {
      type: String,
      required: true,
      trim: true
    },
    floor: {
      type: String,
      required: true,
      trim: true
    },
    room: {
      type: Number,
      required: true,
    }
  },
  labDescription: {
    type: String,
    trim: true
  },
  image: {
    alt: {
      type: String,
      trim: true
    },
    src: {
      type: String,
      trim: true,
    },
    title: {
      type: String,
      trim: true
    }
  },
  seats: {
    type: [seatSchema],
    required: true,
  }
}, { timestamps: true });

// Seat uniqueness in a lab
labSchema.index({ 'seats.col': 1, 'seats.row': 1 }, { unique: true });

module.exports = mongoose.model('lab', labSchema);