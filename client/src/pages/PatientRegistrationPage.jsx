import { useEffect, useState } from 'react';
import {
  createPatient,
  deletePatient,
  fetchPatients,
  updatePatient
} from '../api';

const initialForm = {
  name: '',
  age: '',
  gender: 'Male',
  phone: '',
  address: '',
  disease: ''
};

export default function PatientRegistrationPage() {
  const [patients, setPatients] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState('');
  const [message, setMessage] = useState('');

  const loadPatients = async () => {
    const data = await fetchPatients();
    setPatients(data);
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const resetForm = () => {
    setFormData(initialForm);
    setEditingId('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (editingId) {
      await updatePatient(editingId, { ...formData, age: Number(formData.age) });
      setMessage('Patient updated successfully');
    } else {
      await createPatient({ ...formData, age: Number(formData.age) });
      setMessage('Patient added successfully');
    }

    resetForm();
    loadPatients();
  };

  const handleEdit = (patient) => {
    setEditingId(patient._id);
    setFormData({
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      phone: patient.phone,
      address: patient.address,
      disease: patient.disease
    });
  };

  const handleDelete = async (id) => {
    await deletePatient(id);
    setMessage('Patient deleted successfully');
    loadPatients();
  };

  return (
    <section className="stack-layout">
      <div className="card form-card">
        <h2>{editingId ? 'Edit Patient' : 'Patient Registration'}</h2>
        <form onSubmit={handleSubmit} className="form two-column">
          <label>
            Name
            <input name="name" value={formData.name} onChange={handleChange} required />
          </label>
          <label>
            Age
            <input name="age" type="number" value={formData.age} onChange={handleChange} required />
          </label>
          <label>
            Gender
            <select name="gender" value={formData.gender} onChange={handleChange}>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </label>
          <label>
            Phone
            <input name="phone" value={formData.phone} onChange={handleChange} required />
          </label>
          <label className="full-span">
            Address
            <input name="address" value={formData.address} onChange={handleChange} required />
          </label>
          <label className="full-span">
            Disease
            <input name="disease" value={formData.disease} onChange={handleChange} required />
          </label>
          <div className="button-row full-span">
            <button className="btn primary" type="submit">{editingId ? 'Update Patient' : 'Add Patient'}</button>
            {editingId && (
              <button className="btn secondary" type="button" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
        {message && <p className="success-text">{message}</p>}
      </div>

      <div className="card">
        <h3>All Patients</h3>
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
                  <td className="action-cell">
                    <button className="text-btn" onClick={() => handleEdit(patient)}>Edit</button>
                    <button className="text-btn danger" onClick={() => handleDelete(patient._id)}>Delete</button>
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
