import { useEffect, useState } from 'react';
import { Calendar, Clock, Stethoscope, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { fetchPatients } from '../api';
import Card from '../components/ui/Card';
import MotionButton from '../components/ui/MotionButton';
import AppointmentModal from '../components/ui/AppointmentModal';
import { useAppointments } from '../context/AppointmentContext';
import { useDoctors } from '../context/DoctorContext';

const initialForm = {
  patientName: '',
  doctorName: '',
  date: '',
  time: ''
};

export default function AppointmentBookingPage() {
  const [patients, setPatients] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const { appointments, addAppointment, updateAppointment, removeAppointment } = useAppointments();
  const { doctors } = useDoctors();

  useEffect(() => {
    fetchPatients().then(setPatients);
  }, []);

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await addAppointment(formData);
      toast.success('Appointment booked successfully.');
      setFormData(initialForm);
    } catch (e) {
      toast.error('Unable to book appointment');
    }
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
                <option key={doctor.id || doctor._id} value={doctor.name}>
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

      <Card>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Upcoming Appointments</h3>
        </div>
        <div className="mt-4 grid gap-3">
          {appointments.length === 0 ? (
            <div className="text-sm text-slate-500">No appointments yet.</div>
          ) : (
            appointments.map((a) => (
              <div key={a._id || a.id} className="flex items-center justify-between rounded-2xl border p-3">
                <div>
                  <div className="font-semibold">{a.patientName} — {a.doctorName}</div>
                  <div className="text-sm text-slate-500">{a.date} {a.time}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setModalOpen(true); setSelectedAppointment(a); }} className="rounded-2xl border px-3 py-1 text-sm font-medium">Edit</button>
                  <button onClick={async () => {
                    try {
                      await updateAppointment(a._id || a.id, { status: 'completed' });
                    } catch (e) {
                      toast.error(e.message || 'Unable to update appointment');
                    }
                  }} className="rounded-2xl border px-3 py-1 text-sm font-medium">Complete</button>
                  <button onClick={async () => {
                    try {
                      await updateAppointment(a._id || a.id, { status: 'cancelled' });
                    } catch (e) {
                      toast.error(e.message || 'Unable to update appointment');
                    }
                  }} className="rounded-2xl border px-3 py-1 text-sm font-medium text-rose-600">Cancel</button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <AppointmentModal open={modalOpen} onClose={() => { setModalOpen(false); setSelectedAppointment(null); }} initial={selectedAppointment || {}} />
    </div>
  );
}
