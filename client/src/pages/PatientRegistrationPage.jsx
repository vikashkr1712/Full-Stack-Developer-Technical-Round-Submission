import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Activity,
  Calendar,
  ClipboardList,
  Download,
  Eye,
  FileText,
  Filter,
  MoreVertical,
  Phone,
  Plus,
  PlusCircle,
  Search,
  Trash2,
  User,
  UserPlus,
  UserRound,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { createPatient, deletePatient, fetchPatients, updatePatient } from '../api';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import { exportToCsv } from '../utils/export';
import { formatDate, getInitials } from '../utils/format';

const patientSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  age: z.coerce.number().min(1, 'Age is required').max(120, 'Enter a valid age'),
  gender: z.enum(['Male', 'Female', 'Other']),
  phone: z.string().min(8, 'Phone is required'),
  address: z.string().min(5, 'Address is required'),
  status: z.enum(['Stable', 'Critical']),
  disease: z.string().min(2, 'Disease is required'),
  diseaseOther: z.string().optional(),
  problem: z.string().min(5, 'Problem description is required')
}).refine((values) => (values.disease === 'Other' ? values.diseaseOther?.length >= 2 : true), {
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

const commonDiseases = ['Fever', 'Cold', 'Diabetes', 'Hypertension', 'Asthma', 'Allergy', 'Migraine', 'Injury', 'Other'];
const pageSize = 6;

function Stat({ icon: Icon, label, value, trend, tone }) {
  return (
    <Card className="flex min-h-28 items-center gap-4 p-4">
      <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${tone}`}>
        <Icon size={22} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold leading-tight text-[#5d6b86]">{label}</p>
        <p className="mt-1 text-2xl font-extrabold text-[#081126]">{value}</p>
      </div>
      <span className={`self-start text-sm font-extrabold ${trend.startsWith('-') ? 'text-red-600' : 'text-emerald-600'}`}>{trend}</span>
    </Card>
  );
}

function PatientFormModal({ open, editingId, register, handleSubmit, errors, isSubmitting, onSubmit, onClose, selectedDisease }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center overflow-y-auto bg-[#081126]/45 px-4 py-6 backdrop-blur-sm">
      <form onSubmit={handleSubmit(onSubmit)} className="pm-card w-full max-w-3xl p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-extrabold">{editingId ? 'Edit Patient' : 'Add New Patient'}</h3>
            <p className="mt-1 text-sm font-medium text-[#5d6b86]">Register patient details and clinical notes.</p>
          </div>
          <button type="button" onClick={onClose} className="pm-icon-button h-11 w-11 shrink-0"><X size={20} /></button>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <input className="pm-field h-12 px-4" placeholder="Name" {...register('name')} />
          <input className="pm-field h-12 px-4" type="number" placeholder="Age" {...register('age')} />
          <select className="pm-field h-12 px-4" {...register('gender')}><option>Male</option><option>Female</option><option>Other</option></select>
          <select className="pm-field h-12 px-4" {...register('status')}><option>Stable</option><option>Critical</option></select>
          <input className="pm-field h-12 px-4" placeholder="Phone" {...register('phone')} />
          <select className="pm-field h-12 px-4" {...register('disease')}>
            <option value="">Select disease</option>
            {commonDiseases.map((disease) => <option key={disease}>{disease}</option>)}
          </select>
          {selectedDisease === 'Other' && <input className="pm-field h-12 px-4" placeholder="Specify disease" {...register('diseaseOther')} />}
          <input className="pm-field h-12 px-4 sm:col-span-2" placeholder="Address" {...register('address')} />
          <textarea className="pm-field min-h-28 resize-none px-4 py-3 sm:col-span-2" placeholder="Problem description" {...register('problem')} />
        </div>
        {Object.values(errors).length > 0 && (
          <p className="mt-3 text-sm font-semibold text-red-600">{Object.values(errors)[0]?.message}</p>
        )}
        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="h-12 rounded-xl border border-[#dfe6f2] px-5 font-bold">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="pm-blue-button h-12 px-6">
            <PlusCircle size={18} />
            {editingId ? 'Update Patient' : 'Add Patient'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function PatientRegistrationPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [heroVisible, setHeroVisible] = useState(true);
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');
  const [diseaseFilter, setDiseaseFilter] = useState('all');
  const [sortKey, setSortKey] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [page, setPage] = useState(1);

  const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(patientSchema),
    defaultValues
  });
  const heroRef = useRef(null);
  const selectedDisease = useWatch({ control, name: 'disease' });

  const loadPatients = async () => {
    setLoading(true);
    try {
      setPatients(await fetchPatients());
    } catch (error) {
      toast.error(error.message || 'Unable to load patients.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPatients(); }, []);

  useEffect(() => {
    const node = heroRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => setHeroVisible(entry.isIntersecting),
      { threshold: 0.08 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const openCreate = () => {
    reset(defaultValues);
    setEditingId('');
    setFormOpen(true);
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
    setFormOpen(true);
  };

  const onSubmit = async (values) => {
    const payload = { ...values, disease: values.disease === 'Other' ? values.diseaseOther : values.disease };
    try {
      if (editingId) {
        await updatePatient(editingId, payload);
        toast.success('Patient updated successfully.');
      } else {
        await createPatient(payload);
        toast.success('Patient added successfully.');
      }
      setFormOpen(false);
      reset(defaultValues);
      setEditingId('');
      loadPatients();
    } catch (error) {
      toast.error(error.message || 'Unable to save patient.');
    }
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
    if (search) data = data.filter((patient) => patient.name.toLowerCase().includes(search.toLowerCase()));
    if (genderFilter !== 'all') data = data.filter((patient) => patient.gender === genderFilter);
    if (diseaseFilter !== 'all') data = data.filter((patient) => patient.disease === diseaseFilter);
    data.sort((a, b) => {
      if (sortKey === 'age') return sortDirection === 'asc' ? a.age - b.age : b.age - a.age;
      return sortDirection === 'asc'
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return data;
  }, [patients, search, genderFilter, diseaseFilter, sortKey, sortDirection]);

  const totalPages = Math.max(Math.ceil(filteredPatients.length / pageSize), 1);
  const pagedPatients = filteredPatients.slice((page - 1) * pageSize, page * pageSize);
  const diseaseOptions = useMemo(() => ['all', ...Array.from(new Set(patients.map((patient) => patient.disease)))], [patients]);

  useEffect(() => setPage(1), [search, genderFilter, diseaseFilter, sortKey, sortDirection]);
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);

  const stats = {
    total: patients.length,
    male: patients.filter((patient) => patient.gender === 'Male').length,
    female: patients.filter((patient) => patient.gender === 'Female').length,
    critical: patients.filter((patient) => patient.status === 'Critical').length,
    today: patients.filter((patient) => new Date(patient.createdAt).toDateString() === new Date().toDateString()).length
  };

  const handleExportCsv = () => {
    exportToCsv(filteredPatients.map((patient) => ({
      Name: patient.name,
      Age: patient.age,
      Gender: patient.gender,
      Status: patient.status || 'Stable',
      Phone: patient.phone,
      Disease: patient.disease,
      Created: formatDate(patient.createdAt)
    })), 'patients.csv');
  };

  const rangeStart = filteredPatients.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, filteredPatients.length);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="mx-auto grid max-w-[96rem] gap-5">
      <div ref={heroRef}>
        <Card className="patient-hero-card flex items-center justify-between gap-4 p-5 sm:p-6">
          <div className="flex min-w-0 items-center gap-4">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[#2f55e7] text-white">
              <UserPlus size={32} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold">Add New Patient</h2>
              <p className="mt-1 max-w-md text-sm font-medium leading-6 text-[#43516f]">Register a new patient and start managing their care.</p>
            </div>
          </div>
          <button onClick={openCreate} className="patient-hero-button pm-blue-button h-11 shrink-0 px-5">
            <PlusCircle size={17} />
            <span className="hidden sm:inline">Add Patient</span>
          </button>
        </Card>
      </div>

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-extrabold">Patient Directory</h3>
            <p className="mt-1 text-sm font-medium text-[#43516f]">Filter and manage patient records with advanced controls.</p>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:flex">
            <button onClick={handleExportCsv} className="h-11 rounded-xl border border-[#dfe6f2] px-3 text-sm font-bold"><Download className="mx-auto sm:mr-2 sm:inline" size={16} /><span className="hidden sm:inline">Export </span>CSV</button>
            <button onClick={() => window.print()} className="h-11 rounded-xl border border-[#dfe6f2] px-3 text-sm font-bold"><FileText className="mx-auto sm:mr-2 sm:inline" size={16} /><span className="hidden sm:inline">Export </span>PDF</button>
            <button onClick={() => window.print()} className="pm-blue-button h-11 px-3 text-sm"><ClipboardList size={16} />Print</button>
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="pm-field flex h-12 items-center gap-3 px-4 md:col-span-2 xl:col-span-1"><Search size={18} className="text-[#5d6b86]" /><input className="min-w-0 flex-1 bg-transparent outline-none" placeholder="Search by name" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
          <label className="pm-field flex h-12 items-center gap-3 px-4"><Filter size={18} /><select className="min-w-0 flex-1 bg-transparent outline-none" value={genderFilter} onChange={(event) => setGenderFilter(event.target.value)}><option value="all">All genders</option><option>Male</option><option>Female</option><option>Other</option></select></label>
          <label className="pm-field flex h-12 items-center gap-3 px-4"><UserRound size={18} /><select className="min-w-0 flex-1 bg-transparent outline-none" value={diseaseFilter} onChange={(event) => setDiseaseFilter(event.target.value)}>{diseaseOptions.map((disease) => <option key={disease} value={disease}>{disease === 'all' ? 'All diseases' : disease}</option>)}</select></label>
          <label className="pm-field flex h-12 items-center gap-3 px-4"><Calendar size={18} /><select className="min-w-0 flex-1 bg-transparent outline-none" value={`${sortKey}-${sortDirection}`} onChange={(event) => { const [key, direction] = event.target.value.split('-'); setSortKey(key); setSortDirection(direction); }}><option value="date-desc">Newest first</option><option value="date-asc">Oldest first</option><option value="age-desc">Age high to low</option><option value="age-asc">Age low to high</option></select></label>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <Stat icon={UserPlus} label="Total Patients" value={stats.total} trend="+12%" tone="bg-[#eef2ff] text-[#2f55e7]" />
        <Stat icon={User} label="Male Patients" value={stats.male} trend="+4%" tone="bg-[#eef2ff] text-[#2f55e7]" />
        <Stat icon={User} label="Female Patients" value={stats.female} trend="+6%" tone="bg-[#e7faf5] text-[#00a778]" />
        <Stat icon={Activity} label="Critical Cases" value={stats.critical} trend="-2%" tone="bg-[#ffecef] text-[#e11d48]" />
        <Stat icon={UserPlus} label="New Patients Today" value={stats.today} trend="+3%" tone="bg-[#fff4dc] text-[#f59e0b]" />
      </div>

      <Card className="overflow-hidden p-0">
        <div className="hidden overflow-x-auto lg:block">
          <table className="pm-table">
            <thead><tr><th>Patient</th><th>Disease</th><th>Age</th><th>Gender</th><th>Registered</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {loading ? Array.from({ length: 4 }).map((_, index) => <tr key={index}><td colSpan={7}><Skeleton className="h-10" /></td></tr>) : pagedPatients.map((patient) => (
                <tr key={patient._id} className="hover:bg-[#f8faff]">
                  <td><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-full bg-[#eef2ff] text-sm font-extrabold text-[#2f55e7]">{getInitials(patient.name)}</div><div><p className="font-extrabold">{patient.name}</p><p className="text-sm text-[#5d6b86]">{patient.phone}</p></div></div></td>
                  <td className="font-medium text-[#43516f]">{patient.disease}</td>
                  <td className="font-medium text-[#43516f]">{patient.age}</td>
                  <td className="font-medium text-[#43516f]">{patient.gender}</td>
                  <td className="font-medium text-[#43516f]">{formatDate(patient.createdAt)}</td>
                  <td><Badge label={patient.status || 'Stable'} tone={patient.status === 'Critical' ? 'danger' : 'success'} /></td>
                  <td><div className="flex items-center gap-2"><button onClick={() => setSelectedPatient(patient)} className="rounded-xl border px-3 py-2 text-xs font-bold"><Eye size={13} className="mr-1 inline" />View</button><button onClick={() => handleEdit(patient)} className="rounded-xl border px-3 py-2 text-xs font-bold"><User size={13} className="mr-1 inline" />Edit</button><button onClick={() => confirmDelete(patient)} className="rounded-xl border border-red-200 px-3 py-2 text-xs font-bold text-red-600"><Trash2 size={13} className="mr-1 inline" />Delete</button></div></td>
                </tr>
              ))}
              {!loading && pagedPatients.length === 0 && <tr><td colSpan={7} className="text-center text-[#5d6b86]">No patients found.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="grid lg:hidden">
          <div className="grid grid-cols-[1.7fr_1fr_0.7fr_1fr_2.4rem] border-b border-[#edf1f7] px-4 py-3 text-[0.72rem] font-extrabold uppercase tracking-wide text-[#5d6b86]">
            <span>Patient</span><span>Disease</span><span>Age</span><span>Status</span><span></span>
          </div>
          {pagedPatients.map((patient) => (
            <div key={patient._id} className="grid grid-cols-[1.7fr_1fr_0.7fr_1fr_2.4rem] items-center gap-2 border-b border-[#edf1f7] px-4 py-4">
              <div className="flex min-w-0 items-center gap-3"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#eef2ff] text-sm font-extrabold text-[#2f55e7]">{getInitials(patient.name)}</div><div className="min-w-0"><p className="break-words font-extrabold leading-tight">{patient.name}</p><p className="truncate text-sm text-[#5d6b86]">{patient.phone}</p></div></div>
              <p className="min-w-0 truncate text-sm font-medium text-[#43516f]">{patient.disease}</p>
              <p className="text-sm font-medium text-[#43516f]">{patient.age}</p>
              <Badge label={patient.status || 'Stable'} tone={patient.status === 'Critical' ? 'danger' : 'success'} />
              <div className="relative group">
                <button className="grid h-9 w-9 place-items-center rounded-full"><MoreVertical size={20} /></button>
                <div className="absolute right-0 top-9 z-10 hidden min-w-32 rounded-xl border border-[#dfe6f2] bg-white p-1 shadow-soft group-focus-within:block group-hover:block">
                  <button onClick={() => setSelectedPatient(patient)} className="block w-full rounded-lg px-3 py-2 text-left text-sm font-bold">View</button>
                  <button onClick={() => handleEdit(patient)} className="block w-full rounded-lg px-3 py-2 text-left text-sm font-bold">Edit</button>
                  <button onClick={() => confirmDelete(patient)} className="block w-full rounded-lg px-3 py-2 text-left text-sm font-bold text-red-600">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 text-sm font-medium text-[#43516f]">
          <p>Showing {rangeStart} - {rangeEnd} of {filteredPatients.length} records</p>
          <div className="flex items-center gap-3"><button className="rounded-xl border px-4 py-2 font-bold disabled:opacity-40" onClick={() => setPage((prev) => Math.max(prev - 1, 1))} disabled={page === 1}>Prev</button><span>Page {page} of {totalPages}</span><button className="rounded-xl border px-4 py-2 font-bold disabled:opacity-40" onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))} disabled={page === totalPages}>Next</button></div>
        </div>
      </Card>

      <button
        onClick={openCreate}
        className={`patient-floating-add pm-blue-button ${heroVisible ? 'patient-floating-hidden' : ''}`}
        aria-label="Add patient"
      >
        <Plus size={22} />
      </button>

      <PatientFormModal open={formOpen} editingId={editingId} register={register} handleSubmit={handleSubmit} errors={errors} isSubmitting={isSubmitting} onSubmit={onSubmit} onClose={() => setFormOpen(false)} selectedDisease={selectedDisease} />

      {selectedPatient && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-[#081126]/45 px-4 backdrop-blur-sm">
          <div className="pm-card w-full max-w-lg p-6">
            <div className="flex items-start justify-between gap-4"><div><h3 className="text-2xl font-extrabold">{selectedPatient.name}</h3><p className="font-medium text-[#5d6b86]">{selectedPatient.phone}</p></div><button onClick={() => setSelectedPatient(null)} className="pm-icon-button h-10 w-10"><X size={18} /></button></div>
            <div className="mt-5 grid gap-3 text-sm font-medium text-[#43516f] sm:grid-cols-2">
              <p>Gender: <b>{selectedPatient.gender}</b></p><p>Age: <b>{selectedPatient.age}</b></p><p>Disease: <b>{selectedPatient.disease}</b></p><p>Status: <b>{selectedPatient.status || 'Stable'}</b></p><p className="sm:col-span-2">Problem: <b>{selectedPatient.problem || 'N/A'}</b></p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
