import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, HeartPulse, Users, UserCheck, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { fetchPatients } from '../api';
import { useAppointments } from '../context/AppointmentContext';
import StatCard from '../components/dashboard/StatCard';
import AgeBarChart from '../components/charts/AgeBarChart';
import DiseaseBarChart from '../components/charts/DiseaseBarChart';
import GenderPieChart from '../components/charts/GenderPieChart';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import { formatDate, getInitials } from '../utils/format';
import { useNavigate } from 'react-router-dom';
import { useDoctors } from '../context/DoctorContext';

function isToday(dateString) {
  if (!dateString) return false;
  const date = new Date(dateString);
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

export default function DashboardPage() {
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { doctors } = useDoctors();

  const loadData = async () => {
    setLoading(true);
    try {
      const patientData = await fetchPatients();
      setPatients(patientData);
      // appointments come from context
    } catch (error) {
      toast.error(error.message || 'Unable to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const { appointments: ctxAppointments = [] } = useAppointments();

  useEffect(() => {
    setAppointments(ctxAppointments || []);
  }, [ctxAppointments]);

  const stats = useMemo(() => {
    const totalPatients = patients.length;
    const malePatients = patients.filter((patient) => patient.gender === 'Male').length;
    const femalePatients = patients.filter((patient) => patient.gender === 'Female').length;
    const criticalCases = patients.filter((patient) => {
      if (patient.status) return patient.status === 'Critical';
      const disease = patient.disease?.toLowerCase() || '';
      return disease.includes('critical') || patient.age >= 60;
    }).length;
    const newPatientsToday = patients.filter((patient) => isToday(patient.createdAt)).length;

    return {
      totalPatients,
      malePatients,
      femalePatients,
      criticalCases,
      newPatientsToday
    };
  }, [patients]);

  const genderChart = useMemo(
    () => [
      { name: 'Male', value: stats.malePatients },
      { name: 'Female', value: stats.femalePatients },
      {
        name: 'Other',
        value: Math.max(stats.totalPatients - stats.malePatients - stats.femalePatients, 0)
      }
    ],
    [stats]
  );

  const diseaseChart = useMemo(() => {
    const counts = patients.reduce((acc, patient) => {
      const key = patient.disease || 'Unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [patients]);

  const ageChart = useMemo(() => {
    const buckets = [
      { name: '0-18', value: 0 },
      { name: '19-35', value: 0 },
      { name: '36-55', value: 0 },
      { name: '56+', value: 0 }
    ];

    patients.forEach((patient) => {
      if (patient.age <= 18) buckets[0].value += 1;
      else if (patient.age <= 35) buckets[1].value += 1;
      else if (patient.age <= 55) buckets[2].value += 1;
      else buckets[3].value += 1;
    });

    return buckets;
  }, [patients]);

  const recentPatients = useMemo(() => {
    return [...patients]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  }, [patients]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <Card className="flex flex-wrap items-center justify-between gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Welcome back</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            Your clinical operations snapshot
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Track patient intake, monitor critical cases, and keep appointment flow healthy.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-xs font-semibold text-slate-600 shadow-soft dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300">
            Active appointments
            <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{appointments.length}</p>
          </div>
          <div className="rounded-2xl bg-teal-500/10 px-4 py-3 text-xs font-semibold text-teal-700 dark:bg-teal-500/20 dark:text-teal-200">
            System status
            <p className="mt-1 text-lg font-bold">Stable</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate('/patients')} className="rounded-2xl border px-3 py-2 text-sm">Add Patient</button>
            <button onClick={() => navigate('/appointments')} className="rounded-2xl border px-3 py-2 text-sm">Book Appointment</button>
            <button onClick={() => navigate('/doctors')} className="rounded-2xl border px-3 py-2 text-sm">Add Doctor</button>
            <button onClick={() => navigate('/reports')} className="rounded-2xl border px-3 py-2 text-sm">Export Reports</button>
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-28" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <StatCard
            icon={Users}
            label="Total Patients"
            value={stats.totalPatients}
            trend="+12%"
            gradient="from-brand-50 via-white to-brand-100"
          />
          <StatCard
            icon={UserCheck}
            label="Male Patients"
            value={stats.malePatients}
            trend="+4%"
            gradient="from-slate-50 via-white to-slate-100"
          />
          <StatCard
            icon={UserCheck}
            label="Female Patients"
            value={stats.femalePatients}
            trend="+6%"
            gradient="from-teal-50 via-white to-teal-100"
          />
          <StatCard
            icon={Activity}
            label="Critical Cases"
            value={stats.criticalCases}
            trend="-2%"
            gradient="from-rose-50 via-white to-rose-100"
          />
          <StatCard
            icon={UserPlus}
            label="New Patients Today"
            value={stats.newPatientsToday}
            trend="+3%"
            gradient="from-amber-50 via-white to-amber-100"
          />
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-3">
        <Card>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Gender Distribution</h3>
            <Badge label="Patients" />
          </div>
          <div className="mt-4">
            {genderChart.reduce((sum, item) => sum + item.value, 0) === 0 ? (
              <div className="flex h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <HeartPulse size={24} className="mb-2 text-brand-500" />
                No patient data yet
              </div>
            ) : (
              <GenderPieChart data={genderChart} />
            )}
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Disease Distribution</h3>
            <Badge label="Top 6" />
          </div>
          <div className="mt-4">
            {diseaseChart.length === 0 ? (
              <div className="flex h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <HeartPulse size={24} className="mb-2 text-brand-500" />
                No disease data
              </div>
            ) : (
              <DiseaseBarChart data={diseaseChart} />
            )}
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Age Group Statistics</h3>
            <Badge label="Patients" />
          </div>
          <div className="mt-4">
            {patients.length === 0 ? (
              <div className="flex h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <HeartPulse size={24} className="mb-2 text-brand-500" />
                No age data
              </div>
            ) : (
              <AgeBarChart data={ageChart} />
            )}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Upcoming Appointments</h3>
            <Badge label="Next 7 days" />
          </div>
          <div className="mt-4 grid gap-3">
            {(appointments || []).slice(0, 6).map((a) => (
              <div key={a._id || a.id} className="flex items-center justify-between rounded-2xl border p-3">
                <div>
                  <div className="font-semibold">{a.patientName} • {a.doctorName}</div>
                  <div className="text-sm text-slate-500">{a.date} {a.time}</div>
                </div>
                <div>
                  <Badge label={a.status || 'upcoming'} />
                </div>
              </div>
            ))}
            {(appointments || []).length === 0 && <div className="text-sm text-slate-500">No upcoming appointments.</div>}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Doctor Availability</h3>
            <Badge label="On Duty" />
          </div>
          <div className="mt-4 grid gap-3">
            {(doctors || []).map((d) => (
              <div key={d.id || d._id} className="flex items-center justify-between rounded-2xl border p-3">
                <div>
                  <div className="font-semibold">{d.name}</div>
                  <div className="text-sm text-slate-500">{d.specialization}</div>
                </div>
                <div className="text-sm text-slate-600">{d.availabilityTime}</div>
              </div>
            ))}
            {(doctors || []).length === 0 && <div className="text-sm text-slate-500">No doctors available.</div>}
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Patients</h3>
            <p className="text-sm text-slate-500 dark:text-slate-300">
              Latest admissions across all departments.
            </p>
          </div>
          <button className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300">
            View all
          </button>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-900/70 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Disease</th>
                <th className="px-4 py-3">Age</th>
                <th className="px-4 py-3">Registered</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
              {recentPatients.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400" colSpan={5}>
                    No patients registered yet.
                  </td>
                </tr>
              ) : (
                recentPatients.map((patient) => (
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
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{patient.age}</td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-300">
                      {formatDate(patient.createdAt)}
                    </td>
                    <td className="px-4 py-4">
                      <Badge
                        label={patient.status || (patient.age >= 60 ? 'Critical' : 'Stable')}
                        tone={patient.status === 'Critical' || patient.age >= 60 ? 'warning' : 'success'}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </motion.div>
  );
}
