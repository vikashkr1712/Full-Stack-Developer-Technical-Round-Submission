import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchDoctors as apiFetchDoctors, createDoctor as apiCreateDoctor, updateDoctor as apiUpdateDoctor, deleteDoctor as apiDeleteDoctor } from '../api';
import { useAppointments } from './AppointmentContext';
import { useAuth } from './AuthContext';

const KEY = 'pms-doctors';
const DoctorContext = createContext(null);

export function DoctorProvider({ children }) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const { removeAppointment, appointments } = useAppointments();

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!token) {
        const raw = localStorage.getItem(KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        if (mounted) {
          setDoctors(parsed);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      try {
        const data = await apiFetchDoctors();
        if (mounted) {
          setDoctors(Array.isArray(data) ? data : []);
          localStorage.setItem(KEY, JSON.stringify(Array.isArray(data) ? data : []));
        }
      } catch (e) {
        const raw = localStorage.getItem(KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        if (mounted) setDoctors(parsed);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, [token]);

  useEffect(() => {
    if (!loading) localStorage.setItem(KEY, JSON.stringify(doctors));
  }, [doctors, loading]);

  const addDoctor = async (payload) => {
    const saved = await apiCreateDoctor(payload);
    setDoctors((s) => [saved, ...s]);
    return saved;
  };

  const editDoctor = async (id, updates) => {
    const saved = await apiUpdateDoctor(id, updates);
    setDoctors((s) => s.map((d) => (d.id === id || d._id === id ? saved : d)));
    return saved;
  };

  const removeDoctor = async (id) => {
    // find doctor by id
    const doctor = doctors.find((d) => d.id === id || d._id === id || String(d.id) === String(id));
    await apiDeleteDoctor(id);
    setDoctors((s) => s.filter((d) => !(d.id === id || d._id === id || String(d.id) === String(id))));

    // remove related appointments by doctor name
    if (doctor && doctor.name) {
      const relatedAppointments = (appointments || []).filter((a) => a.doctorName === doctor.name);
      await Promise.all(
        relatedAppointments.map((a) =>
          removeAppointment(a._id || a.id).catch(() => null)
        )
      );
    }
  };

  return (
    <DoctorContext.Provider value={{ doctors, loading, addDoctor, editDoctor, removeDoctor }}>
      {children}
    </DoctorContext.Provider>
  );
}

export function useDoctors() {
  const ctx = useContext(DoctorContext);
  if (!ctx) throw new Error('useDoctors must be used within DoctorProvider');
  return ctx;
}

export default DoctorContext;
