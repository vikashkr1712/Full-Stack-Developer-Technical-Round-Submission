import { useEffect, useState } from 'react';
import { fetchDoctors } from '../api';

export default function DoctorListingPage() {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    fetchDoctors().then(setDoctors);
  }, []);

  return (
    <section className="card">
      <h2>Doctor Listing</h2>
      <p className="section-note">This page shows a simple static list of doctors from the backend.</p>
      <div className="doctor-grid">
        {doctors.map((doctor) => (
          <article className="mini-card doctor-card" key={doctor.id}>
            <h3>{doctor.name}</h3>
            <p>{doctor.specialization}</p>
            <span>{doctor.availabilityTime}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
