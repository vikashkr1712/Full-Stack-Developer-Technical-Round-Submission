import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Calendar,
  ClipboardList,
  Download,
  Eye,
  FileText,
  Filter,
  MapPin,
  Phone,
  PlusCircle,
  ShieldAlert,
  Stethoscope,
  StickyNote,
  Search,
  Trash2,
  User,
  UserRound,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import {
  createPatient,
  deletePatient,
  fetchPatients,
  updatePatient
} from '../api';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Skeleton from '../components/ui/Skeleton';
import MotionButton from '../components/ui/MotionButton';
import { exportToCsv } from '../utils/export';
import { formatDate, getInitials } from '../utils/format';

const patientSchema = z
  .object({
    name: z.string().min(2, 'Name is required'),
    age: z.coerce.number().min(1, 'Age is required').max(120, 'Enter a valid age'),
    gender: z.enum(['Male', 'Female', 'Other']),
    phone: z.string().min(8, 'Phone is required'),
    address: z.string().min(5, 'Address is required'),
    status: z.enum(['Stable', 'Critical']),
    disease: z.string().min(2, 'Disease is required'),
    diseaseOther: z.string().optional(),
    problem: z.string().min(5, 'Problem description is required')
  })
  .refine((values) => (values.disease === 'Other' ? values.diseaseOther?.length >= 2 : true), {
    message: 'Please specify the disease',
    path: ['diseaseOther']
  });

const defaultValues = {
  name: '',
  age: '',
  gender: 'Male',
  phone: '',
  address: '',
  status: 'Stable',
  disease: '',
  diseaseOther: '',
  problem: ''
};

const commonDiseases = [
  'Fever',
  'Cold',
  'Diabetes',
  'Hypertension',
  'Asthma',
  'Allergy',
  'Migraine',
  'Injury',
  'Other'
];

const pageSize = 6;

export default function PatientRegistrationPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');
  const [diseaseFilter, setDiseaseFilter] = useState('all');
  const [sortKey, setSortKey] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [page, setPage] = useState(1);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(patientSchema),
    defaultValues
  });

  const selectedDisease = useWatch({ control, name: 'disease' });

  const loadPatients = async () => {
    setLoading(true);
    try {
      const data = await fetchPatients();
      setPatients(data);
    } catch (error) {
      toast.error(error.message || 'Unable to load patients.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const resetForm = () => {
    reset(defaultValues);
    setEditingId('');
  };

  const onSubmit = async (values) => {
    const payload = {
      ...values,
      disease: values.disease === 'Other' ? values.diseaseOther : values.disease
    };
    try {
      if (editingId) {
        await updatePatient(editingId, payload);
        toast.success('Patient updated successfully.');
      } else {
        await createPatient(payload);
        toast.success('Patient added successfully.');
      }
      resetForm();
      loadPatients();
    } catch (error) {
      toast.error(error.message || 'Unable to save patient.');
    }
  };

  const handleEdit = (patient) => {
    setEditingId(patient._id);
    reset({
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      phone: patient.phone,
      address: patient.address,
      status: patient.status || 'Stable',
      disease: commonDiseases.includes(patient.disease) ? patient.disease : 'Other',
      diseaseOther: commonDiseases.includes(patient.disease) ? '' : patient.disease,
      problem: patient.problem || ''
    });
  };

  const confirmDelete = (patient) => {
    toast(`Delete ${patient.name}?`, {
      action: {
        label: 'Delete',
        onClick: async () => {
          try {
            await deletePatient(patient._id);
            toast.success('Patient deleted.');
            loadPatients();
          } catch (error) {
            toast.error(error.message || 'Unable to delete patient.');
          }
        }
      }
    });
  };

  const filteredPatients = useMemo(() => {
    let data = [...patients];

    if (search) {
      data = data.filter((patient) => patient.name.toLowerCase().includes(search.toLowerCase()));
    }

    if (genderFilter !== 'all') {
      data = data.filter((patient) => patient.gender === genderFilter);
    }

    if (diseaseFilter !== 'all') {
      data = data.filter((patient) => patient.disease === diseaseFilter);
    }

    data.sort((a, b) => {
      if (sortKey === 'age') {
        return sortDirection === 'asc' ? a.age - b.age : b.age - a.age;
      }
      const aDate = new Date(a.createdAt).getTime();
      const bDate = new Date(b.createdAt).getTime();
      return sortDirection === 'asc' ? aDate - bDate : bDate - aDate;
    });

    return data;
  }, [patients, search, genderFilter, diseaseFilter, sortKey, sortDirection]);

  const totalPages = Math.max(Math.ceil(filteredPatients.length / pageSize), 1);
  const pagedPatients = filteredPatients.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [search, genderFilter, diseaseFilter, sortKey, sortDirection]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const diseaseOptions = useMemo(() => {
    const diseases = new Set(patients.map((patient) => patient.disease));
    return ['all', ...Array.from(diseases)];
  }, [patients]);

  const handleExportCsv = () => {
    const rows = filteredPatients.map((patient) => ({
      Name: patient.name,
      Age: patient.age,
      Gender: patient.gender,
      Status: patient.status || 'Stable',
      Phone: patient.phone,
      Address: patient.address,
      Disease: patient.disease,
      Problem: patient.problem || '',
      Created: formatDate(patient.createdAt)
    }));
    exportToCsv(rows, 'patients.csv');
  };

  const handleExportPdf = () => {
    window.print();
  };

  const rangeStart = filteredPatients.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, filteredPatients.length);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="grid gap-6"
    >
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Patient intake</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
              {editingId ? 'Edit patient record' : 'Register new patient'}
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Capture personal details and clinical metadata in a structured format.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="floating-input">
            <input className="peer" placeholder=" " {...register('name')} />
            <User className="pointer-events-none absolute right-4 top-3 text-slate-400" size={16} />
            <label>Name</label>
            {errors.name && <p className="text-xs text-rose-500">{errors.name.message}</p>}
          </div>
          <div className="floating-input">
            <input className="peer" placeholder=" " type="number" {...register('age')} />
            <Calendar className="pointer-events-none absolute right-4 top-3 text-slate-400" size={16} />
            <label>Age</label>
            {errors.age && <p className="text-xs text-rose-500">{errors.age.message}</p>}
          </div>
          <div className="floating-input">
            <select className="peer" {...register('gender')}>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
            <UserRound className="pointer-events-none absolute right-4 top-3 text-slate-400" size={16} />
            <label>Gender</label>
            {errors.gender && <p className="text-xs text-rose-500">{errors.gender.message}</p>}
          </div>
          <div className="floating-input">
            <select className="peer" {...register('status')}>
              <option>Stable</option>
              <option>Critical</option>
            </select>
            <ShieldAlert className="pointer-events-none absolute right-4 top-3 text-slate-400" size={16} />
            <label>Status</label>
            {errors.status && <p className="text-xs text-rose-500">{errors.status.message}</p>}
          </div>
          <div className="floating-input">
            <input className="peer" placeholder=" " {...register('phone')} />
            <Phone className="pointer-events-none absolute right-4 top-3 text-slate-400" size={16} />
            <label>Phone</label>
            {errors.phone && <p className="text-xs text-rose-500">{errors.phone.message}</p>}
          </div>
          <div className="floating-input lg:col-span-2">
            <input className="peer" placeholder=" " {...register('address')} />
            <MapPin className="pointer-events-none absolute right-4 top-3 text-slate-400" size={16} />
            <label>Address</label>
            {errors.address && <p className="text-xs text-rose-500">{errors.address.message}</p>}
          </div>
          <div className="floating-input">
            <select className="peer" {...register('disease')}>
              <option value="">Select disease</option>
              {commonDiseases.map((disease) => (
                <option key={disease} value={disease}>
                  {disease}
                </option>
              ))}
            </select>
            <Stethoscope className="pointer-events-none absolute right-4 top-3 text-slate-400" size={16} />
            <label>Disease</label>
            {errors.disease && <p className="text-xs text-rose-500">{errors.disease.message}</p>}
          </div>
          {selectedDisease === 'Other' && (
            <div className="floating-input">
              <input className="peer" placeholder=" " {...register('diseaseOther')} />
              <Stethoscope className="pointer-events-none absolute right-4 top-3 text-slate-400" size={16} />
              <label>Specify disease</label>
              {errors.diseaseOther && <p className="text-xs text-rose-500">{errors.diseaseOther.message}</p>}
            </div>
          )}
          <div className="floating-input lg:col-span-2">
            <textarea className="peer" placeholder=" " {...register('problem')} />
            <StickyNote className="pointer-events-none absolute right-4 top-3 text-slate-400" size={16} />
            <label>Problem description</label>
            {errors.problem && <p className="text-xs text-rose-500">{errors.problem.message}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-3 lg:col-span-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300"
              onClick={resetForm}
            >
              <X size={14} />
              Reset
            </button>
            <MotionButton
              type="submit"
              className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-soft transition hover:-translate-y-0.5"
              disabled={isSubmitting}
            >
              <PlusCircle size={14} />
              {editingId ? 'Update Patient' : 'Save Patient'}
            </MotionButton>
          </div>
        </form>
      </Card>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Patient Directory</h3>
            <p className="text-sm text-slate-500 dark:text-slate-300">
              Filter and manage patient records with advanced controls.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300"
            >
              <Download size={14} />
              Export CSV
            </button>
            <button
              onClick={handleExportPdf}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300"
            >
              Export PDF
            </button>
            <button
              onClick={handleExportPdf}
              className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-3 py-2 text-xs font-semibold text-white shadow-soft transition hover:-translate-y-0.5"
            >
              <ClipboardList size={14} />
              Print
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-4">
          <label className="relative flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-sm text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300">
            <Search size={16} />
            <input
              className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-100"
              placeholder="Search by name"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300">
            <Filter size={16} />
            <select
              className="w-full bg-transparent text-sm text-slate-700 outline-none dark:text-slate-100"
              value={genderFilter}
              onChange={(event) => setGenderFilter(event.target.value)}
            >
              <option value="all">All genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </label>
          <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300">
            <UserRound size={16} />
            <select
              className="w-full bg-transparent text-sm text-slate-700 outline-none dark:text-slate-100"
              value={diseaseFilter}
              onChange={(event) => setDiseaseFilter(event.target.value)}
            >
              {diseaseOptions.map((disease) => (
                <option key={disease} value={disease}>
                  {disease === 'all' ? 'All diseases' : disease}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300">
            <Calendar size={16} />
            <select
              className="w-full bg-transparent text-sm text-slate-700 outline-none dark:text-slate-100"
              value={`${sortKey}-${sortDirection}`}
              onChange={(event) => {
                const [key, direction] = event.target.value.split('-');
                setSortKey(key);
                setSortDirection(direction);
              }}
            >
              <option value="date-desc">Newest first</option>
              <option value="date-asc">Oldest first</option>
              <option value="age-desc">Age high to low</option>
              <option value="age-asc">Age low to high</option>
            </select>
          </label>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="max-h-[520px] overflow-auto scrollbar-thin">
            <table className="min-w-full text-left text-sm">
              <thead className="sticky top-0 bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-900/70 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3">Patient</th>
                  <th className="px-4 py-3">Disease</th>
                  <th className="px-4 py-3">Gender</th>
                  <th className="px-4 py-3">Age</th>
                  <th className="px-4 py-3">Registered</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
                {loading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <tr key={index}>
                      <td className="px-4 py-4" colSpan={7}>
                        <Skeleton className="h-10" />
                      </td>
                    </tr>
                  ))
                ) : pagedPatients.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400" colSpan={7}>
                      No patients found. Try adjusting your filters.
                    </td>
                  </tr>
                ) : (
                  pagedPatients.map((patient) => (
                    <tr key={patient._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="grid h-9 w-9 place-items-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                            {getInitials(patient.name)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">{patient.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{patient.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{patient.disease}</td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{patient.gender}</td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{patient.age}</td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300">
                        {formatDate(patient.createdAt)}
                      </td>
                      <td className="px-4 py-4">
                        <Badge
                          label={patient.status || 'Stable'}
                          tone={patient.status === 'Critical' ? 'danger' : 'success'}
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                            onClick={() => setSelectedPatient(patient)}
                          >
                            <Eye size={12} />
                            View
                          </button>
                          <button
                            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                            onClick={() => handleEdit(patient)}
                          >
                            <User size={12} />
                            Edit
                          </button>
                          <button
                            className="inline-flex items-center gap-1 rounded-xl border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                            onClick={() => confirmDelete(patient)}
                          >
                            <Trash2 size={12} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500 dark:text-slate-300">
          <p>
            Showing {rangeStart} - {rangeEnd} of {filteredPatients.length} records
          </p>
          <div className="flex items-center gap-2">
            <button
              className="rounded-xl border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
            >
              Prev
            </button>
            <span className="text-xs">Page {page} of {totalPages}</span>
            <button
              className="rounded-xl border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300"
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </Card>

      <Modal open={Boolean(selectedPatient)} onClose={() => setSelectedPatient(null)}>
        {selectedPatient && (
          <div className="mt-4 grid gap-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="grid h-14 w-14 place-items-center rounded-full bg-brand-100 text-lg font-semibold text-brand-700">
                  {getInitials(selectedPatient.name)}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{selectedPatient.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-300">{selectedPatient.phone}</p>
                </div>
              </div>
              <Badge
                label={selectedPatient.status || 'Stable'}
                tone={selectedPatient.status === 'Critical' ? 'danger' : 'success'}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-950">
                <p className="text-xs font-semibold uppercase text-slate-400">Personal</p>
                <p className="mt-2 text-slate-700 dark:text-slate-200">Gender: {selectedPatient.gender}</p>
                <p className="text-slate-700 dark:text-slate-200">Age: {selectedPatient.age}</p>
                <p className="text-slate-700 dark:text-slate-200">Address: {selectedPatient.address}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-950">
                <p className="text-xs font-semibold uppercase text-slate-400">Medical</p>
                <p className="mt-2 text-slate-700 dark:text-slate-200">Disease: {selectedPatient.disease}</p>
                <p className="text-slate-700 dark:text-slate-200">Problem: {selectedPatient.problem || 'N/A'}</p>
                <p className="text-slate-700 dark:text-slate-200">
                  Registered: {formatDate(selectedPatient.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-soft"
                onClick={() => {
                  handleEdit(selectedPatient);
                  setSelectedPatient(null);
                }}
              >
                <User size={14} />
                Edit Patient
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 px-4 py-2 text-xs font-semibold text-rose-600"
                onClick={() => {
                  confirmDelete(selectedPatient);
                  setSelectedPatient(null);
                }}
              >
                <Trash2 size={14} />
                Delete Patient
              </button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
