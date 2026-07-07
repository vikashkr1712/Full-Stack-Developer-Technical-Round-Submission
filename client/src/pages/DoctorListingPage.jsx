import { useMemo, useState } from 'react';
import { Edit, PlusCircle, Search, Stethoscope, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import DoctorModal from '../components/ui/DoctorModal';
import { useDoctors } from '../context/DoctorContext';
import { getInitials } from '../utils/format';

const colors = [
  'bg-[#eef2ff] text-[#2f55e7]',
  'bg-[#e7faf5] text-[#00a778]',
  'bg-[#fff4dc] text-[#f59e0b]',
  'bg-[#f4ecff] text-[#7c3aed]',
  'bg-[#ffecef] text-[#e11d48]'
];

export default function DoctorListingPage() {
  const { doctors, loading, removeDoctor } = useDoctors();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return (doctors || []).filter((doctor) =>
      `${doctor.name} ${doctor.specialization}`.toLowerCase().includes(search.toLowerCase())
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
          } catch {
            toast.error('Unable to delete doctor');
          }
        }
      }
    });
  };

  return (
    <div className="mx-auto grid max-w-[96rem] gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold sm:text-3xl">Doctors</h2>
          <p className="mt-2 text-base font-medium text-[#43516f]">Manage your medical staff and their availability.</p>
        </div>
      </div>

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-extrabold">Doctor Listing</h3>
            <p className="mt-1 max-w-lg text-sm font-medium leading-6 text-[#43516f]">
              Discover specialists on duty and their availability windows.
            </p>
          </div>
          <button
            onClick={() => { setSelectedDoctor(null); setModalOpen(true); }}
            className="doctor-add-desktop pm-blue-button h-12 px-5"
          >
            <PlusCircle size={18} />
            Add Doctor
          </button>
        </div>
        <div className="mt-5 grid gap-4">
          <label className="pm-field flex h-12 items-center gap-3 px-4">
            <Search size={19} className="text-[#5d6b86]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search doctors or specialization"
              className="min-w-0 flex-1 bg-transparent outline-none"
            />
          </label>
          <button
            onClick={() => { setSelectedDoctor(null); setModalOpen(true); }}
            className="doctor-add-mobile pm-blue-button h-12 w-full"
          >
            <PlusCircle size={18} />
            Add Doctor
          </button>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-48" />)
        ) : filtered.length === 0 ? (
          <Card className="md:col-span-2">
            <p className="text-sm font-semibold text-[#5d6b86]">No doctors found.</p>
          </Card>
        ) : (
          filtered.map((doctor, index) => (
            <Card key={doctor.id || doctor._id} className="relative min-h-44 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 gap-4">
                  <div className={`hidden h-16 w-16 shrink-0 place-items-center rounded-full text-xl font-extrabold sm:grid ${colors[index % colors.length]}`}>
                    {getInitials(doctor.name)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="break-words text-xl font-extrabold uppercase leading-tight sm:text-base">
                      {doctor.name}
                    </h4>
                    <p className="mt-1 text-base font-medium text-[#43516f] sm:text-sm">{doctor.specialization}</p>
                    <div className="mt-4 inline-flex max-w-full items-center gap-2 rounded-xl bg-[#eef3ff] px-3 py-2 text-sm font-extrabold text-[#34425f]">
                      <span className="h-2 w-2 shrink-0 rounded-full bg-[#2f55e7]" />
                      <span className="truncate">Available: {doctor.availabilityTime}</span>
                    </div>
                  </div>
                </div>
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#eef2ff] text-[#2f55e7]">
                  <Stethoscope size={22} />
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  onClick={() => { setSelectedDoctor(doctor); setModalOpen(true); }}
                  className="inline-flex h-10 min-w-32 items-center justify-center gap-2 rounded-xl border border-[#dfe6f2] px-4 text-sm font-extrabold transition hover:bg-[#f7f9ff]"
                >
                  <Edit size={17} />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(doctor)}
                  className="inline-flex h-10 min-w-32 items-center justify-center gap-2 rounded-xl border border-red-200 px-4 text-sm font-extrabold text-red-600 transition hover:bg-red-50"
                >
                  <Trash2 size={17} />
                  Delete
                </button>
              </div>
            </Card>
          ))
        )}
      </div>

      <DoctorModal open={modalOpen} onClose={() => setModalOpen(false)} initial={selectedDoctor} />
    </div>
  );
}
