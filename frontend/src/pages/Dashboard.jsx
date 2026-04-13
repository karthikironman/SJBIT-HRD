import React from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import StudentDashboard from './dashboard/stud_dashboard';
import AdminDashboard from './dashboard/adm_dashboard';

const ADM_ROLES = ['ADMIN', 'SUPER_USER', 'FPC'];

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!user || Object.keys(user).length === 0) return null;

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) await apiClient.post('/auth/logout', { refreshToken });
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  if (ADM_ROLES.includes(user.role)) {
    return <AdminDashboard user={user} onLogout={handleLogout} />;
  }

  return <StudentDashboard user={user} onLogout={handleLogout} />;
};

export default Dashboard;
