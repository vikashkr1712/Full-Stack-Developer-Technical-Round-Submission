import { useEffect, useState } from 'react';
import { Stethoscope } from 'lucide-react';
import { fetchDoctors } from '../api';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';

export default function DoctorListingPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctors()
      .then(setDoctors)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="grid gap-6">
      <Card>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Medical staff</p>
        <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">Doctor Listing</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Discover specialists on duty and their availability windows.
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-40" />)
          : doctors.map((doctor) => (
              <Card key={doctor.id} className="space-y-4">
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
                <button className="w-full rounded-2xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-soft">
                  Book Appointment
                </button>
              </Card>
            ))}
      </div>
    </div>
  );
}
