import { Link } from 'react-router-dom';
import { ArrowRight, HeartPulse, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
	const { token } = useAuth();

	return (
		<div className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
			<div className="mx-auto max-w-6xl">
				<header className="flex flex-wrap items-center justify-between gap-4">
					<div className="flex items-center gap-3">
						<div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-600 text-white shadow-soft">
							<HeartPulse size={22} />
						</div>
						<div>
							<p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Healthcare Suite</p>
							<h1 className="text-xl font-semibold">Patient Management System</h1>
						</div>
					</div>
					<div className="flex items-center gap-3">
						{!token ? (
							<Link
								className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-200"
								to="/login"
							>
								Admin Login
							</Link>
						) : (
							<Link
								className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-200"
								to="/dashboard"
							>
								Go to Dashboard
							</Link>
						)}
						<Link
							className="rounded-2xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5"
							to="/dashboard"
						>
							View Demo
						</Link>
					</div>
				</header>

				<section className="mt-12 grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
					<div className="rounded-2xl border border-slate-200 bg-white/80 p-8 shadow-soft dark:border-slate-800 dark:bg-slate-900/70">
						<p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">Healthcare Platform</p>
						<h2 className="mt-4 text-4xl font-bold leading-tight text-slate-900 dark:text-white">
							A premium command center for patients, appointments, and clinical insights.
						</h2>
						<p className="mt-4 text-slate-600 dark:text-slate-300">
							Manage intake, triage, and analytics with a polished SaaS experience built for modern hospitals and
							outpatient clinics.
						</p>
						<div className="mt-6 flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-300">
							<span className="rounded-full border border-slate-200 bg-white/70 px-3 py-1 dark:border-slate-800 dark:bg-slate-900/70">
								HIPAA-ready workflows
							</span>
							<span className="rounded-full border border-slate-200 bg-white/70 px-3 py-1 dark:border-slate-800 dark:bg-slate-900/70">
								Realtime triage status
							</span>
							<span className="rounded-full border border-slate-200 bg-white/70 px-3 py-1 dark:border-slate-800 dark:bg-slate-900/70">
								Analytics-ready exports
							</span>
						</div>
						<div className="mt-6 flex flex-wrap gap-3">
							<Link
								className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5"
								to="/patients"
							>
								Get Started
								<ArrowRight size={16} />
							</Link>
							<Link
								className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-200"
								to="/dashboard"
							>
								Explore Dashboard
							</Link>
						</div>
					</div>

					<div className="grid gap-4">
						{[
							{
								title: 'Secure workflows',
								description: 'Role-based access with audit-ready activity logs.',
								icon: ShieldCheck
							},
							{
								title: 'Clinical intelligence',
								description: 'Track critical cases and surface patient trends in real time.',
								icon: Sparkles
							}
						].map(({ title, description, icon: Icon }) => (
							<div
								key={title}
								className="rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900/70"
							>
								<div className="flex items-center gap-3">
									<div className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
										<Icon size={18} />
									</div>
									<div>
										<p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
										<p className="text-xs text-slate-500 dark:text-slate-300">{description}</p>
									</div>
								</div>
							</div>
						))}
						<div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-brand-50 via-white to-teal-50 p-5 text-sm text-slate-600 shadow-soft dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 dark:text-slate-300">
							<p className="font-semibold text-slate-900 dark:text-white">Operational snapshot</p>
							<p className="mt-2">Monitor daily admissions, appointment load, and patient health trends.</p>
							<div className="mt-4 flex items-center justify-between text-xs">
								<span>System Health</span>
								<span className="rounded-full bg-teal-100 px-2 py-1 font-semibold text-teal-700 dark:bg-teal-900/40 dark:text-teal-200">
									Stable
								</span>
							</div>
						</div>
					</div>
				</section>
			</div>
		</div>
	);
}

