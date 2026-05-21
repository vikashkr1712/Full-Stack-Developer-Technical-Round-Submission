import React from 'react';
import Modal from './Modal';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useAppointments } from '../../context/AppointmentContext';
import { useDoctors } from '../../context/DoctorContext';

const schema = z.object({
  patientName: z.string().min(2),
  doctorName: z.string().min(2),
  date: z.string().min(1),
  time: z.string().min(1),
  disease: z.string().min(2),
  contact: z.string().min(7),
  notes: z.string().optional()
});

export default function AppointmentModal({ open, onClose, initial = {} }) {
  const { addAppointment, updateAppointment } = useAppointments();
  const { doctors } = useDoctors();
  const { register, handleSubmit, reset, formState } = useForm({ resolver: zodResolver(schema), defaultValues: { ...initial } });

  // reset when initial changes
  React.useEffect(() => {
    reset({ ...initial });
  }, [initial, reset]);

  const onSubmit = async (data) => {
    try {
      if (initial && (initial._id || initial.id)) {
        await updateAppointment(initial._id || initial.id, { ...data });
        toast.success('Appointment updated');
      } else {
        await addAppointment({ ...data, status: 'upcoming' });
        toast.success('Appointment booked');
      }
      reset();
      onClose();
    } catch (e) {
      toast.error('Unable to save appointment');
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3">
        <div className="floating-input">
          <input placeholder=" " {...register('patientName')} className="peer" />
          <label>Patient name</label>
        </div>

        <div className="floating-input">
          <select {...register('doctorName')} className="peer" defaultValue={initial?.doctorName || ''}>
            <option value="">Select doctor</option>
            {(doctors || []).map((doctor) => (
              <option key={doctor.id || doctor._id} value={doctor.name}>
                {doctor.name}
              </option>
            ))}
          </select>
          <label>Doctor name</label>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="floating-input">
            <input type="date" {...register('date')} className="peer" />
            <label>Date</label>
          </div>
          <div className="floating-input">
            <input type="time" {...register('time')} className="peer" />
            <label>Time</label>
          </div>
        </div>

        <div className="floating-input">
          <input placeholder=" " {...register('contact')} className="peer" />
          <label>Contact number</label>
        </div>

        <div className="floating-input">
          <input placeholder=" " {...register('disease')} className="peer" />
          <label>Symptoms / disease</label>
        </div>

        <div className="floating-input">
          <textarea placeholder=" " {...register('notes')} className="peer h-24" />
          <label>Notes</label>
        </div>

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-2xl border px-4 py-2 text-sm font-semibold text-slate-600">Cancel</button>
          <button type="submit" disabled={formState.isSubmitting} className="rounded-2xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white">Book</button>
        </div>
      </form>
    </Modal>
  );
}
