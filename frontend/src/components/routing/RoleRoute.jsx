import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Wrap routes that should only be accessible to specific roles.
// Usage: <Route element={<RoleRoute allowedRoles={ROLE_GROUPS.ADMIN} />}>
const RoleRoute = ({ allowedRoles }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
};

export default RoleRoute;
