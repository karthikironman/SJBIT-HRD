import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';

const ForgotPassword = () => {
  const [step, setStep] = useState('email'); // 'email' | 'reset'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await apiClient.post('/auth/forgot-password', { email });
      setMessage(res.data.message);
      setStep('reset');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match.');
    }
    if (newPassword.length < 6) {
      return setError('Password must be at least 6 characters.');
    }
    setLoading(true);
    try {
      const res = await apiClient.post('/auth/reset-password', { email, otp, newPassword });
      setMessage(res.data.message);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await apiClient.post('/auth/forgot-password', { email });
      setMessage(res.data.message);
      setOtp('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-header">
        <h1>{step === 'email' ? 'Forgot Password' : 'Reset Password'}</h1>
        <p>
          {step === 'email'
            ? 'Enter your email to receive an OTP'
            : `Enter the OTP sent to ${email} and your new password`}
        </p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {message && !error && <div className="success-message">{message}</div>}

      {step === 'email' ? (
        <form onSubmit={handleRequestOtp}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={`example@${import.meta.env.VITE_BRAND_DOMAIN || 'example.edu'}`}
              required
              autoFocus
            />
          </div>

          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword}>
          <div className="form-group">
            <label>OTP</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password (min 6 chars)"
              required
            />
          </div>

          <div className="form-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
            />
          </div>

          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleResendOtp}
            disabled={loading}
            style={{ marginTop: '8px' }}
          >
            Resend OTP
          </button>
        </form>
      )}

      <div className="auth-links">
        {step === 'email' ? (
          <p>Remember your password? <Link to="/login">Sign in</Link></p>
        ) : (
          <p>
            Wrong email?{' '}
            <button
              type="button"
              className="link-btn"
              onClick={() => { setStep('email'); setError(null); setMessage(null); setOtp(''); }}
            >
              Go back
            </button>
          </p>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
