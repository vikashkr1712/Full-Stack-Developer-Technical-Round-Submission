const express = require('express');
const doctors = require('../data/doctorsData');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(doctors);
});

module.exports = router;
