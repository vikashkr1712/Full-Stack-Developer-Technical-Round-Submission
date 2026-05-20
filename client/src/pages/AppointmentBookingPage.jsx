import { useEffect, useState } from 'react';
import { Calendar, Clock, Stethoscope, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import {
  createAppointment,
  fetchDoctors,
  fetchPatients
} from '../api';
import Card from '../components/ui/Card';
import MotionButton from '../components/ui/MotionButton';

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
    toast.success('Appointment booked successfully.');
    setFormData(initialForm);
  };

  return (
    <div className="grid gap-6">
      <Card>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Appointments</p>
        <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">Book an Appointment</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Coordinate consultations with available doctors and patients.
        </p>
      </Card>

      <Card className="max-w-3xl">
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <div className="floating-input">
            <select
              className="peer"
              name="patientName"
              value={formData.patientName}
              onChange={handleChange}
              required
            >
              <option value="">Select patient</option>
              {patients.map((patient) => (
                <option key={patient._id} value={patient.name}>
                  {patient.name}
                </option>
              ))}
            </select>
            <UserRound className="pointer-events-none absolute right-4 top-3 text-slate-400" size={16} />
            <label>Patient</label>
          </div>
          <div className="floating-input">
            <select
              className="peer"
              name="doctorName"
              value={formData.doctorName}
              onChange={handleChange}
              required
            >
              <option value="">Select doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.name}>
                  {doctor.name}
                </option>
              ))}
            </select>
            <Stethoscope className="pointer-events-none absolute right-4 top-3 text-slate-400" size={16} />
            <label>Doctor</label>
          </div>
          <div className="floating-input">
            <input
              className="peer"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
            <Calendar className="pointer-events-none absolute right-4 top-3 text-slate-400" size={16} />
            <label>Date</label>
          </div>
          <div className="floating-input">
            <input
              className="peer"
              name="time"
              type="time"
              value={formData.time}
              onChange={handleChange}
              required
            />
            <Clock className="pointer-events-none absolute right-4 top-3 text-slate-400" size={16} />
            <label>Time</label>
          </div>
          <MotionButton
            className="mt-2 h-12 rounded-2xl bg-brand-600 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 md:col-span-2"
            type="submit"
          >
            Book Appointment
          </MotionButton>
        </form>
      </Card>
    </div>
  );
}
