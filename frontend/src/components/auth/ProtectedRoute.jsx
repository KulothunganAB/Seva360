import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const location = useLocation();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  if (roles && !roles.includes(user?.role)) {
    // Redirect to appropriate dashboard based on role
    const dashboardMap = {
      admin: '/admin',
      councillor: '/councillor',
      citizen: '/citizen',
      volunteer: '/volunteer',
    };
    return <Navigate to={dashboardMap[user?.role] || '/'} replace />;
  }
  
  return children;
};

export default ProtectedRoute;
