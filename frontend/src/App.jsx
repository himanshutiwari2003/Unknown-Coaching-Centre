import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import { ToastProvider, Empty } from './components/ui.jsx';
import AppLayout from './layouts/AppLayout.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import Students from './pages/admin/Students.jsx';
import Fees from './pages/admin/Fees.jsx';
import StudentFees from './pages/student/StudentFees.jsx';
import StudentNotifications from './pages/student/StudentNotifications.jsx';
import StudentAnnouncements from './pages/student/StudentAnnouncements.jsx';
import Announcements from './pages/admin/Announcements.jsx';
import SendNotification from './pages/admin/SendNotification.jsx';
import Reports from './pages/admin/Reports.jsx';
import Settings from './pages/admin/Settings.jsx';
import Profile from './pages/student/Profile.jsx';
import StudentHome from './pages/student/StudentHome.jsx';

const Guard = ({ role, children }) => { const { user } = useAuth(); return !user ? <Navigate to="/login" replace /> : user.role !== role ? <Navigate to={`/${user.role}/dashboard`} replace /> : children; };
const Soon = ({ name }) => <Empty text={`${name} is coming in the next build step.`} />;

export default function App() {
  const { user } = useAuth();
  return (
    <ToastProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/student/login" element={<Login />} />
        <Route path="/admin" element={<Guard role="admin"><AppLayout /></Guard>}>
          <Route path="dashboard" element={<Dashboard />} /><Route path="students" element={<Students />} />
          <Route path="fees" element={<Fees />} /><Route path="payments" element={<Fees />} />
          <Route path="notifications" element={<SendNotification />} /><Route path="announcements" element={<Announcements />} /><Route path="reports" element={<Reports />} /><Route path="settings" element={<Settings />} /><Route path="students/:id" element={<Soon name="Student details" />} />
        </Route>
        <Route path="/student" element={<Guard role="student"><AppLayout /></Guard>}>
          <Route path="dashboard" element={<StudentHome />} />
          <Route path="fees" element={<StudentFees />} /><Route path="payments" element={<StudentFees />} />
          <Route path="notifications" element={<StudentNotifications />} /><Route path="announcements" element={<StudentAnnouncements />} /><Route path="profile" element={<Profile />} />
        </Route>
        <Route path="*" element={<Navigate to={user ? `/${user.role}/dashboard` : '/login'} replace />} />
      </Routes>
    </ToastProvider>
  );
}
