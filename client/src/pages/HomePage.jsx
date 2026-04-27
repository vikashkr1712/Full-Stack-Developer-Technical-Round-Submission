import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
	const { token } = useAuth();

	return (
		<section className="hero card">
			<p className="eyebrow">Healthcare Industry</p>
			<h1>Simple Patient Management System</h1>
			<p>
				This is a basic MERN stack project for managing patients, doctors, and appointments.
				It is intentionally kept simple so it can be easy to explain in an interview.
			</p>
			<div className="button-row">
				{!token ? (
					<Link className="btn primary" to="/login">Admin Login</Link>
				) : (
					<Link className="btn primary" to="/dashboard">Go to Dashboard</Link>
				)}
				<Link className="btn secondary" to="/dashboard">View Dashboard</Link>
			</div>
			<div className="feature-grid">
				<Link className="mini-card card-link" to="/patients">
					<span className="card-title">Patient Registration</span>
					<span className="card-text">Add, edit, and delete patient details.</span>
				</Link>
				<Link className="mini-card card-link" to="/doctors">
					<span className="card-title">Doctor Listing</span>
					<span className="card-text">View the static doctor list with availability.</span>
				</Link>
				<Link className="mini-card card-link" to="/appointments">
					<span className="card-title">Appointment Booking</span>
					<span className="card-text">Select a patient and book with date and time.</span>
				</Link>
				<Link className="mini-card card-link" to="/dashboard">
					<span className="card-title">Dashboard</span>
					<span className="card-text">See all patients and appointments in one place.</span>
				</Link>
			</div>
		</section>
	);
}

