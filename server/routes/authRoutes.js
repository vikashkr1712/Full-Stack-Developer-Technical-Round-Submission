const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin12345';

  if (username === adminUsername && password === adminPassword) {
    const token = jwt.sign({ username }, process.env.JWT_SECRET || 'patient_secret_key', {
      expiresIn: '1d'
    });

    return res.json({ token, message: 'Login successful' });
  }

  return res.status(401).json({ message: 'Invalid username or password' });
});

module.exports = router;
