import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import PatientRegistrationPage from './pages/PatientRegistrationPage';
import DoctorListingPage from './pages/DoctorListingPage';
import AppointmentBookingPage from './pages/AppointmentBookingPage';
import DashboardPage from './pages/DashboardPage';

export default function App() {
	return (
		<div className="app-shell">
			<Navbar />
			<main className="page-wrap">
				<Routes>
					<Route path="/" element={<HomePage />} />
					<Route path="/login" element={<LoginPage />} />
					<Route
						path="/patients"
						element={
							<ProtectedRoute>
								<PatientRegistrationPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/doctors"
						element={
							<ProtectedRoute>
								<DoctorListingPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/appointments"
						element={
							<ProtectedRoute>
								<AppointmentBookingPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/dashboard"
						element={
							<ProtectedRoute>
								<DashboardPage />
							</ProtectedRoute>
						}
					/>
					<Route path="*" element={<Navigate to="/" replace />} />
				</Routes>
			</main>
		</div>
	);
}

