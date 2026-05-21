import { useEffect, useState, useMemo } from 'react';
import { Stethoscope, PlusCircle, Edit, Trash2 } from 'lucide-react';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import DoctorModal from '../components/ui/DoctorModal';
import { useDoctors } from '../context/DoctorContext';
import { toast } from 'sonner';

export default function DoctorListingPage() {
  const { doctors, loading, addDoctor, editDoctor, removeDoctor } = useDoctors();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // doctors loaded by DoctorProvider
  }, []);

  const filtered = useMemo(() => {
    if (!doctors) return [];
    return doctors.filter((d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) || d.specialization.toLowerCase().includes(search.toLowerCase())
    );
  }, [doctors, search]);

  const handleDelete = (doctor) => {
    toast(`Delete ${doctor.name}?`, {
      action: {
        label: 'Delete',
        onClick: async () => {
          try {
            await removeDoctor(doctor.id || doctor._id);
            toast.success('Doctor deleted');
          } catch (e) {
            toast.error('Unable to delete doctor');
          }
        }
      }
    });
  };

  return (
    <div className="grid gap-6">
      <Card>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Medical staff</p>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">Doctor Listing</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Discover specialists on duty and their availability windows.</p>
          </div>
          <div className="flex items-center gap-3">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search doctors or specialization" className="floating-input w-72" />
            <button onClick={() => { setSelectedDoctor(null); setModalOpen(true); }} className="rounded-2xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white flex items-center gap-2"><PlusCircle size={16} /> Add Doctor</button>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-40" />)
        ) : (
          filtered.map((doctor) => (
            <Card key={doctor.id || doctor._id} className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">{doctor.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-300">{doctor.specialization}</p>
                </div>
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
                  <Stethoscope size={18} />
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                Available: <span className="font-semibold">{doctor.availabilityTime}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setSelectedDoctor(doctor); setModalOpen(true); }} className="rounded-2xl border px-3 py-1 text-sm font-medium flex items-center gap-2"><Edit size={14} /> Edit</button>
                <button onClick={() => handleDelete(doctor)} className="rounded-2xl border px-3 py-1 text-sm font-medium text-rose-600 flex items-center gap-2"><Trash2 size={14} /> Delete</button>
              </div>
            </Card>
          ))
        )}
      </div>

      <DoctorModal open={modalOpen} onClose={() => setModalOpen(false)} initial={selectedDoctor} />
    </div>
  );
}
