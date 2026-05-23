import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-primary-950 to-dark-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Outlet />
      </div>
      <Toaster position="bottom-right" />
    </div>
  );
};

export default AuthLayout;
