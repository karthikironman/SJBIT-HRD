import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const res = await apiClient.post('/auth/login', {
        email,
        password
      });

      // Save tokens and user info
      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('refreshToken', res.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-header">
        <h1>Welcome Back</h1>
        <p>Sign in to your {import.meta.env.VITE_BRAND_NAME || 'Institution'} account</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleLogin}>
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
            placeholder="••••••••"
            required 
          />
        </div>

        <button type="submit" className="btn">Sign In</button>
      </form>

      <div className="auth-links">
        <p>Don't have an account? <Link to="/register">Create one</Link></p>
      </div>
    </div>
  );
};

export default Login;
