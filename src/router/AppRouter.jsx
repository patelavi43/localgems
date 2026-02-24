import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../components/Login.jsx";
import Signup from "../components/Signup.jsx";
import HomePage from "../components/user/HomePage.jsx";
import UserDashboard from "../components/user/UserDashboard.jsx";
import AdminDashboard from "../components/admin/AdminDashboard.jsx";
import UserLayout from "../components/user/UserLayout.jsx";
import AdminLayout from "../components/admin/AdminLayout.jsx";
import PublicLayout from "../components/user/PublicLayout.jsx";
import { useAuth } from "../components/user/AuthContext.jsx";

function PrivateRoute({ children, role }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

function AppRouter() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* root: always redirect based on login status */}
      <Route
        path="/"
        element={
          user
            ? user.role === "admin"
              ? <Navigate to="/admin" replace />
              : <Navigate to="/user" replace />
            : <Navigate to="/login" replace />
        }
      />

      {/* public pages with background image */}
      <Route
        path="/login"
        element={
          <PublicLayout>
            <Login />
          </PublicLayout>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicLayout>
            <Signup />
          </PublicLayout>
        }
      />

      {/* user pages with navbar */}
      <Route
        path="/home"
        element={
          <PrivateRoute>
            <UserLayout>
              <HomePage />
            </UserLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/user"
        element={
          <PrivateRoute role="user">
            <UserLayout>
              <UserDashboard />
            </UserLayout>
          </PrivateRoute>
        }
      />

      {/* admin pages with sidebar */}
      <Route
        path="/admin"
        element=
          {<PrivateRoute role="admin">
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          </PrivateRoute>}
      />

      {/* fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRouter;
