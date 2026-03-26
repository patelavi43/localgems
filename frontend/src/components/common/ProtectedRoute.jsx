import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ roles = [] }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    const redirectMap = { Admin: '/admin', TalentProvider: '/talent-dashboard', Client: '/' };
    return <Navigate to={redirectMap[user.role] || '/'} replace />;
  }

  return <Outlet />;
}
