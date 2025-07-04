const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  lab_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'labs',
    required: true
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
  }
}, { timestamps: true });

module.exports = mongoose.model('reservation', reservationSchema);