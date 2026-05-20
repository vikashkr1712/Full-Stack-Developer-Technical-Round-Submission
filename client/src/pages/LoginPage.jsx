import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { loginAdmin } from '../api';
import { useAuth } from '../context/AuthContext';
import MotionButton from '../components/ui/MotionButton';

export default function LoginPage() {
	const [formData, setFormData] = useState({ username: '', password: '' });
	const [loading, setLoading] = useState(false);
	const { login } = useAuth();
	const navigate = useNavigate();

	const handleChange = (event) => {
		setFormData({ ...formData, [event.target.name]: event.target.value });
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		setLoading(true);

		try {
			const response = await loginAdmin(formData.username, formData.password);
			login(response.token);
			toast.success('Welcome back. Access granted.');
			navigate('/dashboard');
		} catch (loginError) {
			toast.error(loginError.message || 'Login failed.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
			<div className="mx-auto max-w-4xl">
				<div className="grid items-center gap-10 rounded-2xl border border-slate-200 bg-white/80 p-8 shadow-soft dark:border-slate-800 dark:bg-slate-900/70 lg:grid-cols-[1.1fr_0.9fr]">
					<div>
						<p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">Admin Access</p>
						<h2 className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">Sign in to the care console</h2>
						<p className="mt-3 text-slate-600 dark:text-slate-300">
							Securely manage patient records, appointments, and clinical analytics.
						</p>
							<div className="mt-5 grid gap-2 text-xs text-slate-500 dark:text-slate-400">
								<span className="rounded-full border border-slate-200 bg-white/70 px-3 py-1 dark:border-slate-800 dark:bg-slate-900/70">
									Encrypted session tokens
								</span>
								<span className="rounded-full border border-slate-200 bg-white/70 px-3 py-1 dark:border-slate-800 dark:bg-slate-900/70">
									Role based access controls
								</span>
							</div>
						<div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
							Use the administrator credentials configured in the backend to access the dashboard.
						</div>
					</div>

					<form onSubmit={handleSubmit} className="grid gap-4">
						<div className="floating-input">
							<input
								className="peer"
								name="username"
								placeholder=" "
								value={formData.username}
								onChange={handleChange}
								required
							/>
							<label>Username</label>
						</div>
						<div className="floating-input">
							<input
								className="peer"
								name="password"
								type="password"
								placeholder=" "
								value={formData.password}
								onChange={handleChange}
								required
							/>
							<label>Password</label>
						</div>
						<MotionButton
							className="mt-2 h-12 rounded-2xl bg-brand-600 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
							type="submit"
							disabled={loading}
						>
							{loading ? 'Signing in...' : 'Sign in'}
						</MotionButton>
					</form>
				</div>
			</div>
		</div>
	);
}

