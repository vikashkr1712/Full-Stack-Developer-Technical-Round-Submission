import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchAppointments as apiFetchAppointments, createAppointment as apiCreateAppointment, updateAppointment as apiUpdateAppointment, deleteAppointment as apiDeleteAppointment } from '../api';
import { useAuth } from './AuthContext';

const KEY = 'pms-appointments';
const AppointmentContext = createContext(null);

export function AppointmentProvider({ children }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!token) {
        const raw = localStorage.getItem(KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        if (mounted) {
          setAppointments(parsed);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      try {
        const data = await apiFetchAppointments();
        if (mounted) {
          setAppointments(Array.isArray(data) ? data : []);
          localStorage.setItem(KEY, JSON.stringify(Array.isArray(data) ? data : []));
        }
      } catch (e) {
        // fallback to localStorage
        const raw = localStorage.getItem(KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        if (mounted) setAppointments(parsed);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => (mounted = false);
  }, [token]);

  useEffect(() => {
    if (!loading) localStorage.setItem(KEY, JSON.stringify(appointments));
  }, [appointments, loading]);

  const addAppointment = async (payload) => {
    const saved = await apiCreateAppointment(payload);
    setAppointments((s) => [saved, ...s]);
    return saved;
  };

  const updateAppointment = async (id, updates) => {
    const saved = await apiUpdateAppointment(id, updates);
    setAppointments((s) => s.map((a) => (a._id === id || a.id === id ? saved : a)));
    return saved;
  };

  const removeAppointment = async (id) => {
    await apiDeleteAppointment(id);
    setAppointments((s) => s.filter((a) => a._id !== id && a.id !== id));
  };

  return (
    <AppointmentContext.Provider value={{ appointments, loading, addAppointment, updateAppointment, removeAppointment }}>
      {children}
    </AppointmentContext.Provider>
  );
}

export function useAppointments() {
  const ctx = useContext(AppointmentContext);
  if (!ctx) throw new Error('useAppointments must be used within AppointmentProvider');
  return ctx;
}

export default AppointmentContext;
