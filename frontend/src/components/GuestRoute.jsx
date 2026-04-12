import { Navigate, Outlet } from 'react-router-dom';

const GuestRoute = () => {
  const token = localStorage.getItem('accessToken');

  if (token) {
    // If authenticated, redirect away from guest routes (e.g., login/register) to the dashboard
    return <Navigate to="/dashboard" replace />;
  }

  // If not authenticated, render the child routes
  return <Outlet />;
};

export default GuestRoute;
