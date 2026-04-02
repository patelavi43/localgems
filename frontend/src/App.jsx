import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/common/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoadingScreen from './components/common/LoadingScreen';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Public pages
import HomePage from './pages/client/HomePage';
import TalentListPage from './pages/client/TalentListPage';
import TalentProfilePage from './pages/client/TalentProfilePage';
import EventsPage from './pages/client/EventsPage';

// Client pages
import MyBookingsPage from './pages/client/MyBookingsPage';
import BookingDetailPage from './pages/client/BookingDetailPage';
import ChatPage from './pages/client/ChatPage';

// Talent pages
import TalentDashboardPage from './pages/talent/TalentDashboardPage';
import EditProfilePage from './pages/talent/EditProfilePage';
import ManageAvailabilityPage from './pages/talent/ManageAvailabilityPage';
import TalentBookingsPage from './pages/talent/TalentBookingsPage';

// Admin pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminVerifyTalentsPage from './pages/admin/AdminVerifyTalentsPage';

export default function App() {
  const { loading } = useAuth();
  if (loading) return <LoadingScreen />;

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Layout wrapper for all main pages */}
      <Route element={<Layout />}>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/talent" element={<TalentListPage />} />
        <Route path="/talent/:id" element={<TalentProfilePage />} />
        <Route path="/events" element={<EventsPage />} />

        {/* Client protected */}
        <Route element={<ProtectedRoute roles={['Client']} />}>
          <Route path="/bookings" element={<MyBookingsPage />} />
          <Route path="/bookings/:id" element={<BookingDetailPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/chat/:conversationId" element={<ChatPage />} />
        </Route>

        {/* Talent protected */}
        <Route element={<ProtectedRoute roles={['TalentProvider']} />}>
          <Route path="/talent-dashboard" element={<TalentDashboardPage />} />
          <Route path="/talent-profile/edit" element={<EditProfilePage />} />
          <Route path="/talent-availability" element={<ManageAvailabilityPage />} />
          <Route path="/talent-bookings" element={<TalentBookingsPage />} />
        </Route>

        {/* Admin protected */}
        <Route element={<ProtectedRoute roles={['Admin']} />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/verify-talents" element={<AdminVerifyTalentsPage />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
