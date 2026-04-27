import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAdmin } from '../api';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
	const [formData, setFormData] = useState({ username: '', password: '' });
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const { login } = useAuth();
	const navigate = useNavigate();

	const handleChange = (event) => {
		setFormData({ ...formData, [event.target.name]: event.target.value });
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		setError('');
		setLoading(true);

		try {
			const response = await loginAdmin(formData.username, formData.password);
			login(response.token);
			navigate('/dashboard');
		} catch (loginError) {
			setError(loginError.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<section className="card form-card">
			<h2>Admin Login</h2>
			<form onSubmit={handleSubmit} className="form">
				<label>
					Username
					<input name="username" value={formData.username} onChange={handleChange} />
				</label>
				<label>
					Password
					<input name="password" type="password" value={formData.password} onChange={handleChange} />
				</label>
				{error && <p className="error-text">{error}</p>}
				<button className="btn primary" type="submit" disabled={loading}>
					{loading ? 'Logging in...' : 'Login'}
				</button>
			</form>
		</section>
	);
}

