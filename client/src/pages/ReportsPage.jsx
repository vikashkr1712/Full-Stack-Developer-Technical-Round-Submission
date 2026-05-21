import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { fetchPatients } from '../api';
import { useDoctors } from '../context/DoctorContext';
import { useAppointments } from '../context/AppointmentContext';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area, CartesianGrid, Legend } from 'recharts';
import { exportToCsv } from '../utils/export';

const COLORS = ['#2563eb', '#14b8a6', '#f59e0b', '#ef4444', '#94a3b8'];

export default function ReportsPage() {
  const [patients, setPatients] = useState([]);
  const { doctors } = useDoctors();
  const { appointments } = useAppointments();
  const [range, setRange] = useState('30'); // days

  useEffect(() => {
    fetchPatients().then(setPatients).catch(() => setPatients([]));
  }, []);

  const stats = useMemo(() => {
    const totalPatients = patients.length;
    const avgAge = patients.length ? Math.round(patients.reduce((s, p) => s + (p.age || 0), 0) / patients.length) : 0;
    const diseaseCounts = patients.reduce((acc, p) => {
      const k = p.disease || 'Unknown';
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {});
    const mostCommonDisease = Object.entries(diseaseCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
    const mostBookedDoctor = (appointments || []).reduce((acc, a) => {
      acc[a.doctorName] = (acc[a.doctorName] || 0) + 1;
      return acc;
    }, {});
    const topDoctor = Object.entries(mostBookedDoctor).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    return { totalPatients, avgAge, mostCommonDisease, topDoctor };
  }, [patients, appointments]);

  const growthSeries = useMemo(() => {
    const days = parseInt(range, 10);
    const map = {};
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toISOString().slice(0, 10);
      map[key] = 0;
    }
    patients.forEach((p) => {
      const d = p.createdAt ? p.createdAt.slice(0, 10) : null;
      if (d && map[d] !== undefined) map[d]++;
    });
    return Object.entries(map).map(([date, value]) => ({ date, value }));
  }, [patients, range]);

  const diseaseData = useMemo(() => {
    const counts = patients.reduce((acc, p) => {
      const k = p.disease || 'Unknown';
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [patients]);

  const appointmentByStatus = useMemo(() => {
    const s = (appointments || []).reduce((acc, a) => {
      acc[a.status || 'upcoming'] = (acc[a.status || 'upcoming'] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(s).map(([name, value]) => ({ name, value }));
  }, [appointments]);

  const handleExportPatients = () => {
    const rows = patients.map((p) => ({ Name: p.name, Age: p.age, Gender: p.gender, Disease: p.disease, Phone: p.phone }));
    exportToCsv(rows, 'patients.csv');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="grid gap-6">
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Reports</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">Analytics & Exports</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Patient growth, disease trends and appointment analytics.</p>
          </div>
          <div className="flex items-center gap-2">
            <select value={range} onChange={(e) => setRange(e.target.value)} className="rounded-2xl border px-3 py-2">
              <option value="7">7 days</option>
              <option value="30">30 days</option>
              <option value="90">90 days</option>
            </select>
            <button onClick={handleExportPatients} className="rounded-2xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white">Export Patients</button>
            <button onClick={() => window.print()} className="rounded-2xl border px-4 py-2 text-sm">Print</button>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-slate-500">Total patients</p>
          <h3 className="text-2xl font-bold">{stats.totalPatients}</h3>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Average age</p>
          <h3 className="text-2xl font-bold">{stats.avgAge}</h3>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Most common disease</p>
          <h3 className="text-2xl font-bold">{stats.mostCommonDisease}</h3>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <p className="text-sm text-slate-500">Patient growth</p>
          <div className="mt-3 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthSeries}>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip
                  formatter={(value) => [value, 'Patients Added']}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <p className="text-sm text-slate-500">Disease distribution</p>
          <div className="mt-3 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip formatter={(value) => [value, 'Patients']} />
                <Pie data={diseaseData} dataKey="value" nameKey="name" outerRadius={80} fill="#8884d8" label>
                  {diseaseData.map((entry, index) => (
                    <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <p className="text-sm text-slate-500">Appointment status</p>
          <div className="mt-3 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={appointmentByStatus}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [value, 'Appointments']} />
                <Bar dataKey="value" fill="#14b8a6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <p className="text-sm text-slate-500">Doctor workload</p>
          <div className="mt-3 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={(doctors || []).map((d) => ({ name: d.name, value: (appointments || []).filter((a) => a.doctorName === d.name).length }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip
                  formatter={(value) => [value, 'Booked Appointments']}
                  labelFormatter={(label) => `Doctor: ${label}`}
                />
                <Bar dataKey="value" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <p className="text-sm text-slate-500">Patients by gender</p>
          <div className="mt-3 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip formatter={(value) => [value, 'Patients']} />
                <Pie data={[{ name: 'Male', value: patients.filter((p) => p.gender === 'Male').length }, { name: 'Female', value: patients.filter((p) => p.gender === 'Female').length }, { name: 'Other', value: patients.filter((p) => p.gender === 'Other').length }]} dataKey="value" nameKey="name" outerRadius={80}>
                  <Cell fill="#2563eb" />
                  <Cell fill="#14b8a6" />
                  <Cell fill="#94a3b8" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}
