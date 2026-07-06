import { useState } from 'react';
import { ArrowRight, CalendarCheck, CheckCircle2, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import AppointmentModal from '../components/ui/AppointmentModal';
import { useAppointments } from '../context/AppointmentContext';

export default function AppointmentBookingPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const { appointments = [], updateAppointment } = useAppointments();

  const openBook = () => {
    setSelectedAppointment(null);
    setModalOpen(true);
  };

  return (
    <div className="mx-auto grid max-w-[96rem] gap-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold sm:text-3xl">Appointments</h2>
          <p className="mt-2 text-base font-medium text-[#43516f]">Manage and schedule patient appointments.</p>
        </div>
        <button onClick={openBook} className="pm-blue-button h-12 px-5 text-base">
          <PlusCircle size={18} />
          Book Appointment
        </button>
      </div>

      <Card className="overflow-hidden">
        <h3 className="text-xl font-extrabold">Upcoming Appointments</h3>
        <div className="mt-5 grid gap-4">
          {appointments.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#dfe6f2] p-6 text-sm font-semibold text-[#5d6b86]">
              No appointments yet.
            </div>
          ) : (
            appointments.map((appointment) => (
              <div
                key={appointment._id || appointment.id}
                className="grid gap-4 rounded-xl border border-[#dfe6f2] bg-white/75 p-4 md:grid-cols-[1fr_auto]"
              >
                <div className="min-w-0">
                  <p className="break-words text-lg font-extrabold">
                    {appointment.patientName} <span className="text-[#5d6b86]">—</span> {appointment.doctorName}
                  </p>
                  <p className="mt-2 text-sm font-medium text-[#43516f]">{appointment.date} {appointment.time}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge label={appointment.status || 'Upcoming'} tone={appointment.status === 'cancelled' ? 'danger' : 'success'} />
                  <button
                    onClick={() => { setSelectedAppointment(appointment); setModalOpen(true); }}
                    className="h-10 rounded-xl border border-[#dfe6f2] px-4 text-sm font-extrabold"
                  >
                    Edit
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        await updateAppointment(appointment._id || appointment.id, { ...appointment, status: 'completed' });
                      } catch (e) {
                        toast.error(e.message || 'Unable to update appointment');
                      }
                    }}
                    className="h-10 rounded-xl border border-[#dfe6f2] px-4 text-sm font-extrabold"
                  >
                    Complete
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        await updateAppointment(appointment._id || appointment.id, { ...appointment, status: 'cancelled' });
                      } catch (e) {
                        toast.error(e.message || 'Unable to update appointment');
                      }
                    }}
                    className="h-10 rounded-xl border border-red-200 px-4 text-sm font-extrabold text-red-600"
                  >
                    Cancel
                  </button>
                  <ArrowRight size={18} className="hidden text-[#5d6b86] lg:block" />
                </div>
              </div>
            ))
          )}
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm font-medium text-[#43516f]">
          <p>Showing 1 - {Math.min(appointments.length, 6)} of {appointments.length || 0} records</p>
          <div className="flex items-center gap-3">
            <button className="rounded-xl border border-[#dfe6f2] px-4 py-2 font-bold opacity-40">Prev</button>
            <span>Page 1 of 1</span>
            <button className="rounded-xl border border-[#dfe6f2] px-4 py-2 font-bold">Next</button>
          </div>
        </div>
      </Card>

      <Card className="grid gap-4 md:hidden">
        <div className="flex items-center gap-4 rounded-xl border border-[#dfe6f2] p-4">
          <div className="grid h-14 w-14 place-items-center rounded-xl bg-[#eef2ff] text-[#2f55e7]"><CalendarCheck size={27} /></div>
          <div><p className="text-lg font-extrabold">Easy Scheduling</p><p className="font-medium text-[#5d6b86]">Choose your preferred date and time</p></div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-[#dfe6f2] p-4">
          <div className="grid h-14 w-14 place-items-center rounded-xl bg-[#e7faf5] text-[#00a778]"><CheckCircle2 size={27} /></div>
          <div><p className="text-lg font-extrabold">Expert Doctors</p><p className="font-medium text-[#5d6b86]">Connect with qualified specialists</p></div>
        </div>
      </Card>

      <AppointmentModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedAppointment(null); }}
        initial={selectedAppointment || {}}
      />
    </div>
  );
}
