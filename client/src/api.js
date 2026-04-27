const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...(options.headers || {})
    },
    ...options
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}

export function loginAdmin(username, password) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
}

export function fetchPatients() {
  return request('/patients');
}

export function createPatient(patient) {
  return request('/patients', {
    method: 'POST',
    body: JSON.stringify(patient)
  });
}

export function updatePatient(id, patient) {
  return request(`/patients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(patient)
  });
}

export function deletePatient(id) {
  return request(`/patients/${id}`, { method: 'DELETE' });
}

export function fetchDoctors() {
  return request('/doctors');
}

export function fetchAppointments() {
  return request('/appointments');
}

export function createAppointment(appointment) {
  return request('/appointments', {
    method: 'POST',
    body: JSON.stringify(appointment)
  });
}

export function deleteAppointment(id) {
  return request(`/appointments/${id}`, { method: 'DELETE' });
}
