const express = require('express');
const Doctor = require('../models/Doctor');
const authMiddleware = require('../middleware/authMiddleware');
const seedDoctors = require('../data/doctorsData');

const router = express.Router();

router.use(authMiddleware);

router.get('/', async (req, res) => {
  let doctors = await Doctor.find().sort({ createdAt: -1 });

  if (doctors.length === 0 && Array.isArray(seedDoctors) && seedDoctors.length > 0) {
    await Doctor.insertMany(seedDoctors);
    doctors = await Doctor.find().sort({ createdAt: -1 });
  }

  res.json(doctors);
});

router.post('/', async (req, res) => {
  const doctor = new Doctor(req.body);
  const savedDoctor = await doctor.save();
  res.status(201).json(savedDoctor);
});

router.put('/:id', async (req, res) => {
  const updatedDoctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
    new: true
  });
  res.json(updatedDoctor);
});

router.delete('/:id', async (req, res) => {
  await Doctor.findByIdAndDelete(req.params.id);
  res.json({ message: 'Doctor deleted successfully' });
});

module.exports = router;
