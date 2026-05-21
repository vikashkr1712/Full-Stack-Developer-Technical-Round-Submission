import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AppointmentProvider } from './context/AppointmentContext';
import { DoctorProvider } from './context/DoctorContext';
import { SettingsProvider } from './context/SettingsContext';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
	<React.StrictMode>
		<BrowserRouter>
			<ThemeProvider>
				<AuthProvider>
					<AppointmentProvider>
						<DoctorProvider>
							<SettingsProvider>
								<App />
								<Toaster richColors position="top-right" />
							</SettingsProvider>
						</DoctorProvider>
					</AppointmentProvider>
				</AuthProvider>
			</ThemeProvider>
		</BrowserRouter>
	</React.StrictMode>
);

