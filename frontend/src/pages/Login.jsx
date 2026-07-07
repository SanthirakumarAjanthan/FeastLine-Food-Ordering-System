import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(user.role === 'admin' ? '/admin' : '/menu');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div className="surface form-card">
          <p className="eyebrow" style={{ marginBottom: 6 }}>Welcome back</p>
          <h2 style={{ marginBottom: 24 }}>Log in to your account</h2>
          {error && <div className="form-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email address</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Logging in…' : 'Log in'}
            </button>
          </form>
          <p className="form-footnote">
            New here? <Link to="/register" style={{ color: 'var(--chili)', fontWeight: 600 }}>Create an account</Link>
          </p>
          <p className="form-footnote">
            Are you an admin? <Link to="/admin/login" style={{ color: 'var(--chili)', fontWeight: 600 }}>Admin login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
