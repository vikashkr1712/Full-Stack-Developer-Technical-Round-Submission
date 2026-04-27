import { useEffect, useState } from 'react';
import {
  createAppointment,
  fetchDoctors,
  fetchPatients
} from '../api';

const initialForm = {
  patientName: '',
  doctorName: '',
  date: '',
  time: ''
};

export default function AppointmentBookingPage() {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchPatients().then(setPatients);
    fetchDoctors().then(setDoctors);
  }, []);

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await createAppointment(formData);
    setMessage('Appointment booked successfully');
    setFormData(initialForm);
  };

  return (
    <section className="card form-card">
      <h2>Appointment Booking</h2>
      <form onSubmit={handleSubmit} className="form two-column">
        <label>
          Patient
          <select name="patientName" value={formData.patientName} onChange={handleChange} required>
            <option value="">Select patient</option>
            {patients.map((patient) => (
              <option key={patient._id} value={patient.name}>
                {patient.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Doctor
          <select name="doctorName" value={formData.doctorName} onChange={handleChange} required>
            <option value="">Select doctor</option>
            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.name}>
                {doctor.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Date
          <input name="date" type="date" value={formData.date} onChange={handleChange} required />
        </label>
        <label>
          Time
          <input name="time" type="time" value={formData.time} onChange={handleChange} required />
        </label>
        <button className="btn primary full-span" type="submit">
          Book Appointment
        </button>
      </form>
      {message && <p className="success-text">{message}</p>}
    </section>
  );
}
