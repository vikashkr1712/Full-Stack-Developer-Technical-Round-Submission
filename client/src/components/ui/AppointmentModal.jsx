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

const TIME_OPTIONS = [
  '08:00 AM',
  '08:30 AM',
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '12:00 PM',
  '12:30 PM',
  '01:00 PM',
  '01:30 PM',
  '02:00 PM',
  '02:30 PM',
  '03:00 PM',
  '03:30 PM',
  '04:00 PM',
  '04:30 PM',
  '05:00 PM',
  '05:30 PM',
  '06:00 PM',
  '06:30 PM',
  '07:00 PM',
  '07:30 PM',
  '08:00 PM'
];

const TIME_GROUPS = [
  { label: 'Morning', slots: TIME_OPTIONS.slice(0, 8) },
  { label: 'Afternoon', slots: TIME_OPTIONS.slice(8, 18) },
  { label: 'Evening', slots: TIME_OPTIONS.slice(18) }
];

function Field({ icon: Icon, label, children, rightIcon = true, className = '' }) {
  return (
    <label className={`pm-field flex min-h-16 items-center gap-3 px-4 py-2 ${className}`}>
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
  const [timeOpen, setTimeOpen] = useState(false);
  const isEditing = Boolean(initial && (initial._id || initial.id));
  const { register, handleSubmit, reset, formState, watch, setValue } = useForm({
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
  const selectedTime = watch('time');

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

  const chooseTime = (time) => {
    setValue('time', time, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    setTimeOpen(false);
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
          <div className="relative">
            <input type="hidden" {...register('time')} />
            <button
              type="button"
              onClick={() => setTimeOpen((value) => !value)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') setTimeOpen(false);
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setTimeOpen((value) => !value);
                }
              }}
              className={`pm-field pm-time-trigger flex min-h-16 w-full items-center gap-3 px-4 py-2 text-left ${timeOpen ? 'pm-time-trigger-open' : ''}`}
              aria-haspopup="listbox"
              aria-expanded={timeOpen}
            >
              <Clock size={21} className="shrink-0 text-[#7c89a2]" />
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-semibold text-[#65728e]">Time</span>
                <span className={`block text-base font-semibold ${selectedTime ? 'text-[#081126]' : 'text-[#65728e]'}`}>
                  {selectedTime || 'Select time'}
                </span>
              </span>
              <ChevronDown size={19} className={`shrink-0 text-[#34425f] transition ${timeOpen ? 'rotate-180' : ''}`} />
            </button>
            {timeOpen && (
              <div className="pm-time-panel absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 rounded-2xl border border-[#dfe6f2] bg-white p-3 shadow-[0_20px_45px_rgba(35,55,95,0.18)]" role="listbox" aria-label="Appointment time">
                {TIME_GROUPS.map((group) => (
                  <div key={group.label} className="pm-time-group">
                    <p className="px-1 pb-2 text-[0.7rem] font-extrabold uppercase tracking-[0.16em] text-[#65728e]">{group.label}</p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {group.slots.map((time) => {
                        const active = selectedTime === time;
                        return (
                          <button
                            type="button"
                            key={time}
                            onClick={() => chooseTime(time)}
                            className={`pm-time-option ${active ? 'pm-time-option-active' : ''}`}
                            role="option"
                            aria-selected={active}
                          >
                            <span>{time.replace(' ', '')}</span>
                            {active && <Check size={15} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
