const express = require('express');
const Patient = require('../models/Patient');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', async (req, res) => {
  const patients = await Patient.find().sort({ createdAt: -1 });
  res.json(patients);
});

router.post('/', async (req, res) => {
  const patient = new Patient(req.body);
  const savedPatient = await patient.save();
  res.status(201).json(savedPatient);
});

router.put('/:id', async (req, res) => {
  const updatedPatient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
    new: true
  });
  res.json(updatedPatient);
});

router.delete('/:id', async (req, res) => {
  await Patient.findByIdAndDelete(req.params.id);
  res.json({ message: 'Patient deleted successfully' });
});

module.exports = router;
