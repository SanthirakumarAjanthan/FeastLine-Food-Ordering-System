import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', address: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/menu');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div className="surface form-card">
          <p className="eyebrow" style={{ marginBottom: 6 }}>Join FeastLine</p>
          <h2 style={{ marginBottom: 24 }}>Create your account</h2>
          {error && <div className="form-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full name</label>
              <input required value={form.fullName} onChange={update('fullName')} />
            </div>
            <div className="form-group">
              <label>Email address</label>
              <input type="email" required value={form.email} onChange={update('email')} />
            </div>
            <div className="form-group">
              <label>Phone number</label>
              <input required value={form.phone} onChange={update('phone')} />
            </div>
            <div className="form-group">
              <label>Delivery address</label>
              <input value={form.address} onChange={update('address')} placeholder="Optional — can add at checkout" />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={update('password')}
              />
            </div>
            <button className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>
          <p className="form-footnote">
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--chili)', fontWeight: 600 }}>Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
