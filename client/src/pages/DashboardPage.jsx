import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  CalendarCheck,
  Download,
  Stethoscope,
  TrendingUp,
  UserPlus,
  Users
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { fetchPatients } from '../api';
import { useAppointments } from '../context/AppointmentContext';
import { useDoctors } from '../context/DoctorContext';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import GenderPieChart from '../components/charts/GenderPieChart';
import DiseaseBarChart from '../components/charts/DiseaseBarChart';
import AgeBarChart from '../components/charts/AgeBarChart';
import { getInitials } from '../utils/format';

function isToday(dateString) {
  if (!dateString) return false;
  const date = new Date(dateString);
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

function StatTile({ icon: Icon, label, value, trend, tone = 'blue' }) {
  const tones = {
    blue: 'from-[#f4f7ff] to-white text-[#2f55e7]',
    teal: 'from-[#f0fbf8] to-white text-[#00956f]',
    red: 'from-[#fff3f3] to-white text-[#e11d48]',
    amber: 'from-[#fff8e8] to-white text-[#f59e0b]'
  };

  return (
    <Card className={`relative overflow-hidden bg-gradient-to-br ${tones[tone]} p-5`}>
      <div className="flex items-start justify-between gap-3">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-current/10">
          <Icon size={22} />
        </div>
        <span className={`text-sm font-extrabold ${trend?.startsWith('-') ? 'text-red-600' : 'text-emerald-600'}`}>
          {trend}
        </span>
      </div>
      <p className="mt-4 text-sm font-semibold text-[#5d6b86]">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-[#081126]">{value}</p>
    </Card>
  );
}

function QuickAction({ icon: Icon, label, tone, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex min-h-20 items-center justify-center gap-3 rounded-xl border border-[#dfe6f2] bg-white/75 px-4 text-sm font-extrabold text-[#081126] transition hover:-translate-y-0.5 hover:border-[#bfcaf7] hover:bg-[#f7f9ff]"
    >
      <Icon size={24} className={tone} />
      {label}
    </button>
  );
}

export default function DashboardPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const { appointments = [] } = useAppointments();
  const { doctors = [] } = useDoctors();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchPatients()
      .then((data) => {
        if (mounted) setPatients(Array.isArray(data) ? data : []);
      })
      .catch((error) => toast.error(error.message || 'Unable to load dashboard data.'))
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const totalPatients = patients.length;
    const malePatients = patients.filter((patient) => patient.gender === 'Male').length;
    const femalePatients = patients.filter((patient) => patient.gender === 'Female').length;
    const criticalCases = patients.filter((patient) => patient.status === 'Critical' || patient.age >= 60).length;
    const newPatientsToday = patients.filter((patient) => isToday(patient.createdAt)).length;
    return { totalPatients, malePatients, femalePatients, criticalCases, newPatientsToday };
  }, [patients]);

  const genderChart = useMemo(
    () => [
      { name: 'Male', value: stats.malePatients },
      { name: 'Female', value: stats.femalePatients },
      { name: 'Other', value: Math.max(stats.totalPatients - stats.malePatients - stats.femalePatients, 0) }
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

  const upcoming = (appointments || []).slice(0, 3);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="mx-auto grid max-w-[96rem] gap-5">
      <Card className="p-5 sm:p-7">
        <div className="grid gap-6 xl:grid-cols-[1fr_minmax(24rem,34rem)]">
          <div className="min-w-0">
            <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-[#7a88a4]">Welcome back</p>
            <h2 className="mt-2 text-2xl font-extrabold leading-tight text-[#081126] sm:text-3xl">
              Your clinical operations snapshot
            </h2>
            <p className="mt-3 max-w-xl text-[1rem] font-medium leading-7 text-[#43516f]">
              Track patient intake, monitor critical cases, and keep appointment flow healthy.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-[#dfe6f2] bg-white/75 p-4">
                <p className="text-sm font-semibold text-[#43516f]">Active appointments</p>
                <p className="mt-1 text-2xl font-extrabold">{appointments.length}</p>
              </div>
              <div className="rounded-xl border border-[#dcefe9] bg-[#e9f8f4] p-4">
                <p className="text-sm font-semibold text-[#00856b]">System status</p>
                <p className="mt-1 text-2xl font-extrabold text-[#00856b]">Stable</p>
              </div>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <QuickAction icon={UserPlus} label="Add Patient" tone="text-[#2f55e7]" onClick={() => navigate('/patients')} />
            <QuickAction icon={CalendarCheck} label="Book Appointment" tone="text-[#00956f]" onClick={() => navigate('/appointments')} />
            <QuickAction icon={Stethoscope} label="Add Doctor" tone="text-[#5b2ee7]" onClick={() => navigate('/doctors')} />
            <QuickAction icon={Download} label="Export Reports" tone="text-[#f97316]" onClick={() => navigate('/reports')} />
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-32" />)}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <StatTile icon={Users} label="Total Patients" value={stats.totalPatients} trend="+12%" />
          <StatTile icon={UserPlus} label="Male Patients" value={stats.malePatients} trend="+4%" />
          <StatTile icon={UserPlus} label="Female Patients" value={stats.femalePatients} trend="+6%" tone="teal" />
          <StatTile icon={Activity} label="Critical Cases" value={stats.criticalCases} trend="-2%" tone="red" />
          <StatTile icon={UserPlus} label="New Patients Today" value={stats.newPatientsToday} trend="+3%" tone="amber" />
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-3">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-extrabold">Gender Distribution</h3>
            <Badge label="Patients" />
          </div>
          <GenderPieChart data={genderChart} />
        </Card>
        <Card>
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-extrabold">Disease Distribution</h3>
            <Badge label="Top 6" />
          </div>
          <DiseaseBarChart data={diseaseChart.length ? diseaseChart : [{ name: 'No data', value: 0 }]} />
        </Card>
        <Card>
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-extrabold">Age Group Statistics</h3>
            <Badge label="Patients" />
          </div>
          <AgeBarChart data={ageChart} />
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[2fr_1.1fr]">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-extrabold">Upcoming Appointments</h3>
            <Badge label="Next 7 days" />
          </div>
          <div className="mt-4 grid gap-3">
            {upcoming.length === 0 ? (
              <p className="rounded-xl border border-dashed border-[#dfe6f2] p-5 text-sm font-semibold text-[#5d6b86]">No upcoming appointments.</p>
            ) : (
              upcoming.map((appointment) => (
                <div key={appointment._id || appointment.id} className="flex items-center gap-3 rounded-xl border border-[#dfe6f2] bg-white/75 p-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#eef2ff] text-sm font-extrabold text-[#2f55e7]">
                    {getInitials(appointment.patientName || 'Patient')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-extrabold text-[#081126]">
                      {appointment.patientName} <span className="text-[#5d6b86]">•</span> {appointment.doctorName}
                    </p>
                    <p className="text-sm font-medium text-[#5d6b86]">{appointment.date}, {appointment.time}</p>
                  </div>
                  <Badge label={appointment.status || 'Upcoming'} />
                  <ArrowRight size={18} className="hidden text-[#5d6b86] sm:block" />
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-extrabold">Quick Insights</h3>
          <div className="mt-4 grid gap-3">
            {[
              ['Patient growth is up 12%', 'Compared to last 30 days', TrendingUp, 'text-emerald-600'],
              ['Appointments on track', `${appointments.length} active records`, CalendarCheck, 'text-[#2f55e7]'],
              ['Critical cases are stable', `${stats.criticalCases} critical alerts`, Activity, 'text-[#f59e0b]']
            ].map(([title, detail, Icon, tone]) => (
              <div key={title} className="flex items-center gap-3 rounded-xl border border-[#dfe6f2] bg-white/75 p-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#f1f5ff]">
                  <Icon size={18} className={tone} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold text-[#0f5fbe]">{title}</p>
                  <p className="text-xs font-medium text-[#5d6b86]">{detail}</p>
                </div>
              </div>
            ))}
            <button onClick={() => navigate('/reports')} className="flex items-center justify-between rounded-xl border border-[#dfe6f2] bg-white/75 px-4 py-3 text-sm font-extrabold text-[#2f55e7]">
              View full reports
              <ArrowRight size={18} />
            </button>
          </div>
        </Card>
      </div>

      <Card className="lg:hidden">
        <button onClick={() => navigate('/reports')} className="pm-blue-button h-12 w-full">
          <Download size={18} />
          Export Insights
        </button>
        <p className="mt-3 text-center text-sm font-medium text-[#5d6b86]">{doctors.length} doctors available for workload exports.</p>
      </Card>
    </motion.div>
  );
}
