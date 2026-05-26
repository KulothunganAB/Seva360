import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import { setTheme } from '../store/slices/uiSlice';
import { setNotifications } from '../store/slices/uiSlice';
import { initSocket, joinRoom } from '../services/socket';
import { addNotification } from '../store/slices/uiSlice';
import api from '../services/api';

const DashboardLayout = () => {
  const dispatch = useDispatch();
  const { theme } = useSelector(state => state.ui);
  const { user } = useSelector(state => state.auth);
  
  // Apply theme on mount
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);
  
  // Initialize socket
  useEffect(() => {
    if (user?.id) {
      const socket = initSocket(user.id);
      if (user.district) joinRoom(user.district);
      
      socket.on('newAnnouncement', (data) => {
        dispatch(addNotification({
          id: Date.now().toString(),
          title: 'New Announcement',
          message: data.title,
          type: 'announcement',
          isRead: false,
          createdAt: new Date().toISOString(),
        }));
      });
      
      socket.on('complaintUpdate', (data) => {
        dispatch(addNotification({
          id: Date.now().toString(),
          title: 'Complaint Updated',
          message: `Status changed to: ${data.status}`,
          type: 'complaint',
          isRead: false,
          createdAt: new Date().toISOString(),
        }));
      });
      
      socket.on('newEvent', (data) => {
        dispatch(addNotification({
          id: Date.now().toString(),
          title: 'New Event',
          message: data.title,
          type: 'event',
          isRead: false,
          createdAt: new Date().toISOString(),
        }));
      });
    }
  }, [user?.id]);
  
  // Load notifications
  useEffect(() => {
    if (user) {
      api.get('/admin/notifications').then(res => {
        dispatch(setNotifications(res.data.data || []));
      }).catch(() => {});
    }
  }, [user]);
  
  return (
    <div className="flex h-screen bg-blue-50/50 dark:bg-black overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden">
        <Navbar />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6" id="main-content">
          <Outlet />
        </main>
      </div>
      
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            borderRadius: '12px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
          },
          success: {
            iconTheme: { primary: '#16a34a', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#B91C1C', secondary: '#fff' },
          },
        }}
      />
    </div>
  );
};

export default DashboardLayout;
