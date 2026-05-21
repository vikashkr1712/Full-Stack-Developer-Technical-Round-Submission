const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    specialization: { type: String, required: true, trim: true },
    availabilityTime: { type: String, required: true, trim: true },
    contact: { type: String, trim: true },
    email: { type: String, trim: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Doctor', doctorSchema);