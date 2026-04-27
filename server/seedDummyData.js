const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Patient = require('./models/Patient');
const Appointment = require('./models/Appointment');

dotenv.config();

async function seedData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const dummyPatients = [
      {
        name: 'Ravi Kumar',
        age: 32,
        gender: 'Male',
        phone: '9999911111',
        address: 'Kalyanpur, Kanpur',
        disease: 'Fever'
      },
      {
        name: 'Neha Singh',
        age: 27,
        gender: 'Female',
        phone: '9999922222',
        address: 'Panki, Kanpur',
        disease: 'Skin Allergy'
      }
    ];

    const dummyAppointments = [
      {
        patientName: 'Ravi Kumar',
        doctorName: 'Dr. Ananya Sharma',
        date: '2026-04-28',
        time: '10:00'
      },
      {
        patientName: 'Neha Singh',
        doctorName: 'Dr. Meera Patel',
        date: '2026-04-29',
        time: '11:30'
      }
    ];

    for (const patient of dummyPatients) {
      await Patient.updateOne({ phone: patient.phone }, { $set: patient }, { upsert: true });
    }

    for (const appointment of dummyAppointments) {
      await Appointment.updateOne(
        {
          patientName: appointment.patientName,
          doctorName: appointment.doctorName,
          date: appointment.date,
          time: appointment.time
        },
        { $set: appointment },
        { upsert: true }
      );
    }

    console.log('Dummy data inserted/updated successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
}

seedData();
