import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-50/80 via-slate-100 to-slate-100 dark:from-primary-950/40 dark:via-slate-950 dark:to-slate-950 pointer-events-none"
        aria-hidden
      />
      <div className="relative w-full max-w-md">
        <Outlet />
      </div>
      <Toaster position="bottom-right" />
    </div>
  );
};

export default AuthLayout;
