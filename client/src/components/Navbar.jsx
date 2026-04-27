import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="brand">Patient Management System</div>
      <nav className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/patients">Patient Registration</Link>
        <Link to="/doctors">Doctor Listing</Link>
        <Link to="/appointments">Appointment Booking</Link>
        <Link to="/dashboard">Dashboard</Link>
        {!token ? <Link to="/login">Admin Login</Link> : <button onClick={handleLogout}>Logout</button>}
      </nav>
    </header>
  );
}
