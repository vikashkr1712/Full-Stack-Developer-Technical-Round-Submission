const express = require('express');
const Appointment = require('../models/Appointment');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', async (req, res) => {
  const appointments = await Appointment.find().sort({ createdAt: -1 });
  res.json(appointments);
});

router.post('/', async (req, res) => {
  const appointment = new Appointment(req.body);
  const savedAppointment = await appointment.save();
  res.status(201).json(savedAppointment);
});

router.delete('/:id', async (req, res) => {
  await Appointment.findByIdAndDelete(req.params.id);
  res.json({ message: 'Appointment deleted successfully' });
});

module.exports = router;
