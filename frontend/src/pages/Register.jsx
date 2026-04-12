import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      await apiClient.post('/auth/register', {
        email,
        password
      });

      // On successful registration, redirect to login
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-header">
        <h1>Create Account</h1>
        <p>Join the {import.meta.env.VITE_BRAND_NAME || 'Institution'} portal</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleRegister}>
        <div className="form-group">
          <label>Email Address</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder={`example@${import.meta.env.VITE_BRAND_DOMAIN || 'example.edu'}`}
            required 
          />
        </div>
        
        <div className="form-group">
          <label>Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="Create a password (min 6 chars)"
            required 
          />
        </div>

        <button type="submit" className="btn">Register</button>
      </form>

      <div className="auth-links">
        <p>Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
};

export default Register;
