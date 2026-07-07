import React from 'react';
import Modal from './Modal';
import { Clock, Mail, Phone, Save, Stethoscope, Upload, UserRound, X } from 'lucide-react';
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
    <Modal open={open} onClose={onClose} showClose={false} className="doctor-modal-shell max-w-3xl p-0">
      <form onSubmit={handleSubmit(onSubmit)} className="doctor-form">
        <div className="doctor-form-header">
          <div>
            <p className="doctor-form-kicker">Medical staff</p>
            <h3>{initial ? 'Edit Doctor' : 'Add Doctor'}</h3>
            <p>Manage specialist details, contact information, and availability hours.</p>
          </div>
          <button type="button" onClick={onClose} className="pm-icon-button h-12 w-12 shrink-0" aria-label="Close">
            <X size={22} />
          </button>
        </div>

        <div className="doctor-form-body">
          <section className="doctor-photo-panel" aria-label="Doctor profile photo">
            <div className="doctor-avatar-preview">
              <Stethoscope size={34} />
            </div>
            <div className="min-w-0">
              <p className="font-extrabold text-[#081126]">Profile photo</p>
              <p className="mt-1 text-sm font-medium leading-6 text-[#5d6b86]">Add a clear professional photo after saving the doctor profile.</p>
            </div>
            <button type="button" className="doctor-upload-button">
              <Upload size={17} />
              Upload photo
            </button>
          </section>

          <section className="doctor-fields">
            <label className="doctor-field">
              <span><UserRound size={18} /> Full name</span>
              <input placeholder="Dr. Priya Sharma" {...register('name')} />
            </label>

            <label className="doctor-field">
              <span><Stethoscope size={18} /> Specialization</span>
              <select {...register('specialization')} defaultValue="">
                <option value="" disabled>Select specialization</option>
                {SPECIALIZATIONS.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </label>

            <div className="doctor-time-grid">
              <label className="doctor-field">
                <span><Clock size={18} /> Available from</span>
                <select {...register('availabilityStart')} defaultValue="">
                  <option value="" disabled>Start time</option>
                  {TIME_OPTIONS.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label className="doctor-field">
                <span><Clock size={18} /> Available to</span>
                <select {...register('availabilityEnd')} defaultValue="">
                  <option value="" disabled>End time</option>
                  {TIME_OPTIONS.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="doctor-time-grid">
              <label className="doctor-field">
                <span><Phone size={18} /> Contact number</span>
                <input placeholder="+91 98765 43210" {...register('contact')} />
              </label>
              <label className="doctor-field">
                <span><Mail size={18} /> Email</span>
                <input placeholder="doctor@example.com" {...register('email')} />
              </label>
            </div>
          </section>
        </div>

        {Object.keys(formState.errors).length > 0 && (
          <p className="doctor-form-error">Please enter doctor name, specialization, and a valid availability window.</p>
        )}

        <div className="doctor-form-actions">
          <button type="button" onClick={onClose} className="doctor-secondary-button">Cancel</button>
          <button type="submit" disabled={formState.isSubmitting} className="pm-blue-button doctor-primary-button">
            <Save size={18} />
            Save doctor
          </button>
        </div>
      </form>
    </Modal>
  );
}
