import React from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import { ROLE_GROUPS } from '../config/roles';
import StudentDashboard from './roles/student/StudentDashboard';
import AdminDashboard from './roles/admin/AdminDashboard';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  if (!user) return null;

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) await apiClient.post('/auth/logout', { refreshToken });
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      logout();
      navigate('/login');
    }
  };

  if (ROLE_GROUPS.ADMIN.includes(user.role)) {
    return <AdminDashboard user={user} onLogout={handleLogout} />;
  }

  return <StudentDashboard user={user} onLogout={handleLogout} />;
};

export default Dashboard;
