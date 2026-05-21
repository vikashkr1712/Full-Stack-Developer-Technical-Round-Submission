import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import ProtectedRoute from './components/ProtectedRoute';
import AppointmentBookingPage from './pages/AppointmentBookingPage';
import DashboardPage from './pages/DashboardPage';
import DoctorListingPage from './pages/DoctorListingPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import PatientRegistrationPage from './pages/PatientRegistrationPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
	return (
		<Routes>
			<Route path="/" element={<HomePage />} />
			<Route path="/login" element={<LoginPage />} />
			<Route
				path="/dashboard"
				element={
					<ProtectedRoute>
						<AppShell>
							<DashboardPage />
						</AppShell>
					</ProtectedRoute>
				}
			/>
			<Route
				path="/patients"
				element={
					<ProtectedRoute>
						<AppShell>
							<PatientRegistrationPage />
						</AppShell>
					</ProtectedRoute>
				}
			/>
			<Route
				path="/doctors"
				element={
					<ProtectedRoute>
						<AppShell>
							<DoctorListingPage />
						</AppShell>
					</ProtectedRoute>
				}
			/>
			<Route
				path="/appointments"
				element={
					<ProtectedRoute>
						<AppShell>
							<AppointmentBookingPage />
						</AppShell>
					</ProtectedRoute>
				}
			/>
			<Route
				path="/reports"
				element={
					<ProtectedRoute>
						<AppShell>
							<ReportsPage />
						</AppShell>
					</ProtectedRoute>
				}
			/>
			<Route
				path="/settings"
				element={
					<ProtectedRoute>
						<AppShell>
							<SettingsPage />
						</AppShell>
					</ProtectedRoute>
				}
			/>
			<Route path="*" element={<Navigate to="/" replace />} />
		</Routes>
	);
}

