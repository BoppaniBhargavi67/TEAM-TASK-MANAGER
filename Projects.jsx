import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api';
import toast from 'react-hot-toast';

export default function AuthPage() {
  const [tab, setTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'member' });
  const [errors, setErrors] = useState({});

  const validateLogin = () => {
    const e = {};
    if (!loginForm.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(loginForm.email)) e.email = 'Invalid email';
    if (!loginForm.password) e.password = 'Password is required';
    return e;
  };

  const validateSignup = () => {
    const e = {};
    if (!signupForm.name || signupForm.name.length < 2) e.name = 'Name must be at least 2 characters';
    if (!signupForm.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(signupForm.email)) e.email = 'Invalid email';
    if (!signupForm.password || signupForm.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (signupForm.password !== signupForm.confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const errs = validateLogin();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const { data } = await authAPI.login(loginForm);
      login(data.token, data.user);
      toast.success(`Welcome back, ${data.user.name}! 👋`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const errs = validateSignup();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const { data } = await authAPI.signup({ name: signupForm.name, email: signupForm.email, password: signupForm.password, role: signupForm.role });
      login(data.token, data.user);
      toast.success(`Account created! Welcome, ${data.user.name}! 🎉`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">📋</div>
          <h2>Team Task Manager</h2>
          <p>Collaborate. Track. Deliver.</p>
        </div>

        <div className="auth-tabs">
          <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); setErrors({}); }}>Sign In</button>
          <button className={`auth-tab ${tab === 'signup' ? 'active' : ''}`} onClick={() => { setTab('signup'); setErrors({}); }}>Sign Up</button>
        </div>

        {tab === 'login' ? (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-control"
                placeholder="you@example.com"
                value={loginForm.email}
                onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))} />
              {errors.email && <p className="form-error">{errors.email}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" className="form-control"
                placeholder="Enter your password"
                value={loginForm.password}
                onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))} />
              {errors.password && <p className="form-error">{errors.password}</p>}
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In →'}
            </button>
            <div style={{ marginTop: 16, padding: 12, background: 'var(--bg-input)', borderRadius: 8, fontSize: 12, color: 'var(--text-muted)' }}>
              <strong>Demo:</strong> admin@demo.com / password123 (Admin) | member@demo.com / password123 (Member)
            </div>
          </form>
        ) : (
          <form onSubmit={handleSignup}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" className="form-control"
                  placeholder="John Doe"
                  value={signupForm.name}
                  onChange={e => setSignupForm(f => ({ ...f, name: e.target.value }))} />
                {errors.name && <p className="form-error">{errors.name}</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-control"
                  value={signupForm.role}
                  onChange={e => setSignupForm(f => ({ ...f, role: e.target.value }))}>
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-control"
                placeholder="you@example.com"
                value={signupForm.email}
                onChange={e => setSignupForm(f => ({ ...f, email: e.target.value }))} />
              {errors.email && <p className="form-error">{errors.email}</p>}
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Password</label>
                <input type="password" className="form-control"
                  placeholder="Min 6 characters"
                  value={signupForm.password}
                  onChange={e => setSignupForm(f => ({ ...f, password: e.target.value }))} />
                {errors.password && <p className="form-error">{errors.password}</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input type="password" className="form-control"
                  placeholder="Repeat password"
                  value={signupForm.confirmPassword}
                  onChange={e => setSignupForm(f => ({ ...f, confirmPassword: e.target.value }))} />
                {errors.confirmPassword && <p className="form-error">{errors.confirmPassword}</p>}
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account 🚀'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
