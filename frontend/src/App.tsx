import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import DoctorLayout from './layouts/DoctorLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import SubscriptionPlans from './pages/SubscriptionPlans';
import Contact from './pages/Contact';
import About from './pages/About';

// User Pages
import ChatBot from './pages/User/ChatBot';
import Profile from './pages/User/Profile';
import EmotionDashboard from './pages/User/EmotionDashboard';
import Exercises from './pages/User/Exercises';
import ChatHistory from './pages/User/ChatHistory';
import PaymentHistory from './pages/User/PaymentHistory';
import Settings from './pages/User/Settings';
import AlertPage from './pages/User/AlertPage';
import FindDoctor from './pages/User/FindDoctor';
import BookAppointment from './pages/User/BookAppointment';

// Doctor Pages
import DoctorDashboard from './pages/Doctor/Dashboard';
import PatientList from './pages/Doctor/PatientList';
import PatientProfile from './pages/Doctor/PatientProfile';
import PatientChat from './pages/Doctor/PatientChat';
import Appointments from './pages/Doctor/Appointments';
import TherapyLibrary from './pages/Doctor/TherapyLibrary';
import Alerts from './pages/Doctor/Alerts';

// Admin Pages
import AdminDashboard from './pages/Admin/Dashboard';
import UserManagement from './pages/Admin/UserManagement';
import DoctorManagement from './pages/Admin/DoctorManagement';
import SubscriptionManagement from './pages/Admin/SubscriptionManagement';
import AIModelManagement from './pages/Admin/AIModelManagement';
import Analytics from './pages/Admin/Analytics';
import AuditLogs from './pages/Admin/AuditLogs';

// Context & Hooks
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';

import './styles/design-system.css';
import './styles/theme.css';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode; 
  allowedRoles: string[] 
}) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/plans" element={<SubscriptionPlans />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/chat" element={<ChatBot />} />
          </Route>

          {/* User Routes */}
          
          <Route
            path="/user"
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="profile" element={<Profile />} />
            <Route path="dashboard" element={<EmotionDashboard />} />
            <Route path="exercises" element={<Exercises />} />
            <Route path="history" element={<ChatHistory />} />
            <Route path="payments" element={<PaymentHistory />} />
            <Route path="settings" element={<Settings />} />
            <Route path="alert" element={<AlertPage />} />
            <Route path="find-doctor" element={<FindDoctor />} />
            <Route path="book-appointment/:doctorId" element={<BookAppointment />} />
          </Route>

          {/* Doctor Routes */}
          <Route
            path="/doctor"
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DoctorLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<DoctorDashboard />} />
            <Route path="patients" element={<PatientList />} />
            <Route path="patients/:patientId" element={<PatientProfile />} />
            <Route path="patients/:patientId/chat" element={<PatientChat />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="library" element={<TherapyLibrary />} />
            <Route path="alerts" element={<Alerts />} />
          </Route>

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="doctors" element={<DoctorManagement />} />
            <Route path="subscriptions" element={<SubscriptionManagement />} />
            <Route path="ai-models" element={<AIModelManagement />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="audit" element={<AuditLogs />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
