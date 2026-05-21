import React from 'react';
import Modal from './Modal';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useDoctors } from '../../context/DoctorContext';

const SPECIALIZATIONS = [
  'General Physician',
  'Cardiologist',
  'Dermatologist',
  'Pediatrician',
  'Orthopedic',
  'Neurologist',
  'Gynecologist',
  'ENT Specialist',
  'Psychiatrist',
  'Ophthalmologist',
  'Other'
];

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

const schema = z.object({
  name: z.string().min(2),
  specialization: z.string().min(2),
  availabilityStart: z.string().min(2),
  availabilityEnd: z.string().min(2),
  contact: z.string().optional(),
  email: z.string().optional()
}).refine((data) => data.availabilityStart !== data.availabilityEnd, {
  message: 'Start and end time must be different',
  path: ['availabilityEnd']
});

export default function DoctorModal({ open, onClose, initial = null }) {
  const { addDoctor, editDoctor } = useDoctors();
  const { register, handleSubmit, reset, formState } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      specialization: '',
      availabilityStart: '',
      availabilityEnd: '',
      contact: '',
      email: ''
    }
  });

  React.useEffect(() => {
    const [start = '', end = ''] = (initial?.availabilityTime || '').split(' - ');
    reset({
      name: initial?.name || '',
      specialization: initial?.specialization || '',
      availabilityStart: start,
      availabilityEnd: end,
      contact: initial?.contact || '',
      email: initial?.email || ''
    });
  }, [initial, reset]);

  const onSubmit = async (data) => {
    const payload = {
      name: data.name,
      specialization: data.specialization,
      availabilityTime: `${data.availabilityStart} - ${data.availabilityEnd}`,
      contact: data.contact,
      email: data.email
    };

    try {
      if (initial && (initial.id || initial._id)) {
        await editDoctor(initial.id || initial._id, payload);
        toast.success('Doctor updated');
      } else {
        await addDoctor(payload);
        toast.success('Doctor added');
      }
      onClose();
    } catch (e) {
      toast.error('Unable to save doctor');
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3">
        <div className="floating-input">
          <input placeholder=" " {...register('name')} className="peer" />
          <label>Full name</label>
        </div>
        <div className="floating-input">
          <select {...register('specialization')} className="peer" defaultValue="">
            <option value="" disabled>Select specialization</option>
            {SPECIALIZATIONS.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
          <label>Specialization</label>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="floating-input">
            <select {...register('availabilityStart')} className="peer" defaultValue="">
              <option value="" disabled>Start time</option>
              {TIME_OPTIONS.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
            <label>Available from</label>
          </div>
          <div className="floating-input">
            <select {...register('availabilityEnd')} className="peer" defaultValue="">
              <option value="" disabled>End time</option>
              {TIME_OPTIONS.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
            <label>Available to</label>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="floating-input">
            <input placeholder=" " {...register('contact')} className="peer" />
            <label>Contact number</label>
          </div>
          <div className="floating-input">
            <input placeholder=" " {...register('email')} className="peer" />
            <label>Email</label>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-2xl border px-4 py-2 text-sm font-semibold text-slate-600">Cancel</button>
          <button type="submit" disabled={formState.isSubmitting} className="rounded-2xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white">Save</button>
        </div>
      </form>
    </Modal>
  );
}
