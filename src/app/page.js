'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { FiPhone, FiLock, FiArrowRight, FiAlertCircle } from 'react-icons/fi';

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If already authenticated, redirect
  useEffect(() => {
    if (isAuthenticated) {
      window.location.href = '/dashboard';
    }
  }, [isAuthenticated]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Success
      login(data.user, data.token);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Animated background */}
      <div className="login-bg">
        <div className="login-bg-orb" />
        <div className="login-bg-orb" />
        <div className="login-bg-orb" />
      </div>

      {/* Login Card */}
      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon">V</div>
          <h1>VOO School</h1>
          <p>Vidhya • Ojas • Omkara</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="login-error">
            <FiAlertCircle style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
            {error}
          </div>
        )}

        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <div className="input-group">
              <span className="input-prefix">
                <FiPhone style={{ marginRight: '6px' }} />
                +91
              </span>
              <input
                type="tel"
                className="form-input"
                placeholder="10-digit number"
                value={phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setPhone(val);
                }}
                autoFocus
                maxLength={10}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: 'var(--space-md)' }}>
            <label className="form-label">Password</label>
            <div className="input-group">
              <span className="input-prefix">
                <FiLock style={{ marginRight: '6px' }} />
              </span>
              <input
                type="password"
                className="form-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className={`btn btn-primary btn-lg w-full ${loading ? 'btn-loading' : ''}`}
            disabled={loading || phone.replace(/\D/g, '').length !== 10 || !password}
            style={{ marginTop: 'var(--space-lg)' }}
          >
            {!loading && (
              <>
                Login Securely
                <FiArrowRight />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="login-footer" style={{ marginTop: 'var(--space-xl)' }}>
          <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
            Vanasthalipuram, Hyderabad
          </p>
        </div>
      </div>
    </div>
  );
}
