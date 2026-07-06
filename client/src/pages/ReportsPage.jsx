import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Calendar, Download, FileText, Printer, User, Users } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import Card from '../components/ui/Card';
import { fetchPatients } from '../api';
import { useDoctors } from '../context/DoctorContext';
import { useAppointments } from '../context/AppointmentContext';
import { exportToCsv } from '../utils/export';

const COLORS = ['#2f55e7', '#55bea8', '#f59e0b', '#ef4444', '#94a3b8'];

function Stat({ icon: Icon, label, value, tone }) {
  return (
    <Card className="flex min-h-28 items-center gap-4 p-5">
      <div className={`grid h-14 w-14 place-items-center rounded-full ${tone}`}><Icon size={24} /></div>
      <div>
        <p className="text-base font-medium text-[#5d6b86]">{label}</p>
        <p className="mt-1 text-2xl font-extrabold">{value}</p>
      </div>
    </Card>
  );
}

function ChartCard({ title, children, control }) {
  return (
    <Card className="min-w-0">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-lg font-extrabold">{title}</h3>
        {control && <span className="rounded-xl border border-[#dfe6f2] px-3 py-2 text-sm font-bold text-[#34425f]">{control}</span>}
      </div>
      <div className="h-64 min-w-0">{children}</div>
    </Card>
  );
}

export default function ReportsPage() {
  const [patients, setPatients] = useState([]);
  const [range, setRange] = useState('30');
  const { doctors = [] } = useDoctors();
  const { appointments = [] } = useAppointments();

  useEffect(() => {
    fetchPatients().then((data) => setPatients(Array.isArray(data) ? data : [])).catch(() => setPatients([]));
  }, []);

  const stats = useMemo(() => {
    const totalPatients = patients.length;
    const avgAge = totalPatients ? Math.round(patients.reduce((sum, patient) => sum + (patient.age || 0), 0) / totalPatients) : 0;
    const diseaseCounts = patients.reduce((acc, patient) => {
      const key = patient.disease || 'Unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    const mostCommonDisease = Object.entries(diseaseCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
    return { totalPatients, avgAge, mostCommonDisease, totalAppointments: appointments.length };
  }, [patients, appointments]);

  const growthSeries = useMemo(() => {
    const days = Number(range);
    const map = {};
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      map[date.toISOString().slice(0, 10)] = 0;
    }
    patients.forEach((patient) => {
      const date = patient.createdAt?.slice(0, 10);
      if (date && map[date] !== undefined) map[date] += 1;
    });
    return Object.entries(map).map(([date, value]) => ({ date: date.slice(5), value }));
  }, [patients, range]);

  const diseaseData = useMemo(() => {
    const counts = patients.reduce((acc, patient) => {
      const key = patient.disease || 'Unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([name, value]) => ({ name, value })).slice(0, 6);
  }, [patients]);

  const appointmentByStatus = useMemo(() => {
    const counts = (appointments || []).reduce((acc, appointment) => {
      const key = appointment.status || 'upcoming';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [appointments]);

  const doctorWorkload = useMemo(
    () => doctors.map((doctor) => ({
      name: doctor.name,
      value: appointments.filter((appointment) => appointment.doctorName === doctor.name).length
    })),
    [doctors, appointments]
  );

  const genderData = useMemo(() => [
    { name: 'Male', value: patients.filter((patient) => patient.gender === 'Male').length },
    { name: 'Female', value: patients.filter((patient) => patient.gender === 'Female').length },
    { name: 'Other', value: patients.filter((patient) => patient.gender === 'Other').length }
  ], [patients]);

  const handleExportPatients = () => {
    exportToCsv(patients.map((patient) => ({
      Name: patient.name,
      Age: patient.age,
      Gender: patient.gender,
      Disease: patient.disease,
      Phone: patient.phone
    })), 'patients.csv');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mx-auto grid max-w-[96rem] gap-5">
      <div>
        <h2 className="text-2xl font-extrabold sm:text-3xl">Reports</h2>
        <p className="mt-2 text-base font-medium text-[#43516f]">Patient growth, disease trends and appointment analytics.</p>
      </div>

      <Card>
        <h3 className="text-xl font-extrabold">Analytics & Reports</h3>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <label className="pm-field flex h-12 items-center gap-3 px-4">
            <Calendar size={18} />
            <select value={range} onChange={(event) => setRange(event.target.value)} className="min-w-0 flex-1 bg-transparent font-bold outline-none">
              <option value="7">7 days</option>
              <option value="30">30 days</option>
              <option value="90">90 days</option>
            </select>
          </label>
          <button onClick={handleExportPatients} className="pm-blue-button h-12"><Download size={18} />Export Patients</button>
          <button onClick={() => window.print()} className="h-12 rounded-xl border border-[#dfe6f2] bg-white font-extrabold"><Printer size={18} className="mr-2 inline" />Print Report</button>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat icon={Users} label="Total patients" value={stats.totalPatients} tone="bg-[#eef2ff] text-[#2f55e7]" />
        <Stat icon={User} label="Average age" value={stats.avgAge} tone="bg-[#e7faf5] text-[#00a778]" />
        <Stat icon={FileText} label="Most common disease" value={stats.mostCommonDisease} tone="bg-[#fff4dc] text-[#f59e0b]" />
        <Stat icon={BarChart3} label="Total appointments" value={stats.totalAppointments} tone="bg-[#ffecef] text-[#e11d48]" />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <ChartCard title="Patient growth" control="By day">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={growthSeries} margin={{ left: 0, right: 8, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#dfe6f2" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#2f55e7" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Disease distribution" control="By disease">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip />
              <Pie data={diseaseData.length ? diseaseData : [{ name: 'No data', value: 1 }]} dataKey="value" nameKey="name" outerRadius={72}>
                {(diseaseData.length ? diseaseData : [{ name: 'No data' }]).map((entry, index) => <Cell key={entry.name} fill={diseaseData.length ? COLORS[index % COLORS.length] : '#cfd5df'} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Appointment status" control="By status">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={appointmentByStatus.length ? appointmentByStatus : [{ name: 'upcoming', value: 0 }]}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#dfe6f2" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#55bea8" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Doctor workload" control="By doctor">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={doctorWorkload.length ? doctorWorkload : [{ name: 'No data', value: 0 }]} margin={{ bottom: 12 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#dfe6f2" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} tickFormatter={(value) => String(value).slice(0, 14)} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#2f55e7" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Patients by gender" control="By gender">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip />
            <Pie data={genderData.some((item) => item.value) ? genderData : [{ name: 'No data', value: 1 }]} dataKey="value" nameKey="name" outerRadius={78}>
              {(genderData.some((item) => item.value) ? genderData : [{ name: 'No data' }]).map((entry, index) => <Cell key={entry.name} fill={genderData.some((item) => item.value) ? COLORS[index % COLORS.length] : '#cfd5df'} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>
    </motion.div>
  );
}
