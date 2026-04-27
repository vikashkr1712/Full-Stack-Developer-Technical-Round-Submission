import { useEffect, useState } from 'react';
import {
  deleteAppointment,
  deletePatient,
  fetchAppointments,
  fetchPatients
} from '../api';

export default function DashboardPage() {
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const loadData = async () => {
    const [patientData, appointmentData] = await Promise.all([fetchPatients(), fetchAppointments()]);
    setPatients(patientData);
    setAppointments(appointmentData);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeletePatient = async (id) => {
    await deletePatient(id);
    loadData();
  };

  const handleDeleteAppointment = async (id) => {
    await deleteAppointment(id);
    loadData();
  };

  return (
    <section className="stack-layout">
      <div className="card">
        <h2>Dashboard</h2>
        <p className="section-note">This page displays all patients and all appointments in simple tables.</p>
      </div>

      <div className="card">
        <h3>Patients</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Phone</th>
                <th>Disease</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient._id}>
                  <td>{patient.name}</td>
                  <td>{patient.age}</td>
                  <td>{patient.gender}</td>
                  <td>{patient.phone}</td>
                  <td>{patient.disease}</td>
                  <td>
                    <button className="text-btn danger" onClick={() => handleDeletePatient(patient._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h3>Appointments</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Date</th>
                <th>Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment._id}>
                  <td>{appointment.patientName}</td>
                  <td>{appointment.doctorName}</td>
                  <td>{appointment.date}</td>
                  <td>{appointment.time}</td>
                  <td>
                    <button className="text-btn danger" onClick={() => handleDeleteAppointment(appointment._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
