const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    disease: { type: String, required: true },
    status: { type: String, enum: ['Stable', 'Critical'], default: 'Stable' },
    problem: { type: String, trim: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Patient', patientSchema);
