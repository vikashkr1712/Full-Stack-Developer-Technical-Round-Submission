import { useEffect, useState } from 'react';
import { Calendar, Check, ChevronDown, Clock, Info, ListChecks, Stethoscope, UserRound, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useAppointments } from '../../context/AppointmentContext';
import { useDoctors } from '../../context/DoctorContext';
import { fetchPatients } from '../../api';

const schema = z.object({
  patientName: z.string().min(2),
  doctorName: z.string().min(2),
  date: z.string().min(1),
  time: z.string().min(1),
  appointmentType: z.string().optional(),
  reason: z.string().optional(),
  notes: z.string().optional()
});

function Field({ icon: Icon, label, children, rightIcon = true }) {
  return (
    <label className="pm-field flex min-h-16 items-center gap-3 px-4 py-2">
      <Icon size={21} className="shrink-0 text-[#7c89a2]" />
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-semibold text-[#65728e]">{label}</span>
        {children}
      </span>
      {rightIcon && <ChevronDown size={18} className="shrink-0 text-[#34425f]" />}
    </label>
  );
}

export default function AppointmentModal({ open, onClose, initial = {} }) {
  const { addAppointment, updateAppointment } = useAppointments();
  const { doctors } = useDoctors();
  const [patients, setPatients] = useState([]);
  const isEditing = Boolean(initial && (initial._id || initial.id));
  const { register, handleSubmit, reset, formState } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      patientName: '',
      doctorName: '',
      date: '',
      time: '',
      appointmentType: 'Consultation',
      reason: 'Regular Checkup',
      notes: ''
    }
  });

  useEffect(() => {
    if (open) {
      fetchPatients().then((data) => setPatients(Array.isArray(data) ? data : [])).catch(() => setPatients([]));
    }
  }, [open]);

  useEffect(() => {
    document.body.classList.toggle('pm-scroll-lock', open);
    return () => document.body.classList.remove('pm-scroll-lock');
  }, [open]);

  useEffect(() => {
    reset({
      patientName: initial?.patientName || '',
      doctorName: initial?.doctorName || '',
      date: initial?.date || '',
      time: initial?.time || '',
      appointmentType: initial?.appointmentType || 'Consultation',
      reason: initial?.reason || 'Regular Checkup',
      notes: initial?.notes || ''
    });
  }, [initial, reset, open]);

  const onSubmit = async (data) => {
    try {
      const payload = { ...data, status: initial?.status || 'upcoming' };
      if (isEditing) {
        await updateAppointment(initial._id || initial.id, payload);
        toast.success('Appointment updated');
      } else {
        await addAppointment(payload);
        toast.success('Appointment booked');
      }
      onClose();
    } catch (e) {
      toast.error(e.message || 'Unable to save appointment');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center overflow-y-auto bg-[#081126]/45 px-0 pt-8 backdrop-blur-sm sm:items-center sm:px-4 sm:py-8">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="pm-card max-h-[92dvh] w-full overflow-y-auto rounded-b-none p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-2xl sm:max-w-3xl sm:rounded-[1.35rem] sm:p-8"
      >
        <div className="mx-auto mb-7 h-2 w-24 rounded-full bg-[#c4cad8] sm:hidden" />
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-3xl font-extrabold leading-tight">Book an Appointment</h3>
            <p className="mt-2 text-base font-medium text-[#5d6b86]">Fill in the details to schedule an appointment.</p>
          </div>
          <button type="button" onClick={onClose} className="pm-icon-button h-14 w-14 shrink-0 bg-[#f4f6fa]">
            <X size={26} />
          </button>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Field icon={UserRound} label="Select Patient">
            <select {...register('patientName')} className="w-full bg-transparent text-base font-semibold outline-none">
              <option value="">Select patient</option>
              {patients.map((patient) => (
                <option key={patient._id} value={patient.name}>
                  {patient.name} ({patient.phone})
                </option>
              ))}
            </select>
          </Field>
          <Field icon={Stethoscope} label="Select Doctor">
            <select {...register('doctorName')} className="w-full bg-transparent text-base font-semibold outline-none">
              <option value="">Select doctor</option>
              {(doctors || []).map((doctor) => (
                <option key={doctor.id || doctor._id} value={doctor.name}>
                  {doctor.name} ({doctor.specialization})
                </option>
              ))}
            </select>
          </Field>
          <Field icon={Calendar} label="Date" rightIcon={false}>
            <input type="date" {...register('date')} className="w-full bg-transparent text-base font-semibold outline-none" />
          </Field>
          <Field icon={Clock} label="Time">
            <input type="time" {...register('time')} className="w-full bg-transparent text-base font-semibold outline-none" />
          </Field>
          <Field icon={ListChecks} label="Appointment Type">
            <select {...register('appointmentType')} className="w-full bg-transparent text-base font-semibold outline-none">
              <option>Consultation</option>
              <option>Follow-up</option>
              <option>Emergency</option>
              <option>Routine Check</option>
            </select>
          </Field>
          <Field icon={Calendar} label="Reason for Visit">
            <select {...register('reason')} className="w-full bg-transparent text-base font-semibold outline-none">
              <option>Regular Checkup</option>
              <option>New Symptoms</option>
              <option>Report Review</option>
              <option>Medication Advice</option>
            </select>
          </Field>
          <label className="pm-field min-h-36 px-4 py-4 md:col-span-2">
            <span className="block text-sm font-medium text-[#65728e]">Additional Notes (Optional)</span>
            <textarea {...register('notes')} maxLength={250} placeholder="Write any additional notes..." className="mt-2 min-h-20 w-full resize-none bg-transparent text-base outline-none placeholder:text-[#65728e]" />
            <span className="block text-right text-sm font-medium text-[#65728e]">0/250</span>
          </label>
        </div>

        <div className="mt-5 flex gap-4 rounded-xl border border-[#dce8ff] bg-[#f2f7ff] p-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#2f55e7] text-white">
            <Info size={22} />
          </div>
          <div>
            <p className="font-extrabold text-[#1f55d8]">Appointment Information</p>
            <p className="mt-1 text-sm font-medium text-[#43516f]">You will receive a confirmation SMS and email with appointment details.</p>
          </div>
        </div>

        {Object.keys(formState.errors).length > 0 && (
          <p className="mt-4 text-sm font-bold text-red-600">Please select a patient, doctor, date and time.</p>
        )}

        <div className="mt-6 grid gap-3">
          <button type="submit" disabled={formState.isSubmitting} className="pm-blue-button h-14 w-full text-lg">
            <Check size={21} />
            Confirm Appointment
          </button>
          <button type="button" onClick={onClose} className="h-14 rounded-xl border border-[#dfe6f2] bg-white text-lg font-extrabold">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
