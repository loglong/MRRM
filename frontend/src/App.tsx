import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import PatientsPage from './pages/patients/PatientsPage';
import PatientDetailPage from './pages/patients/PatientDetailPage';
import DemandsPage from './pages/DemandsPage';
import PathsPage from './pages/PathsPage';
import TouchpointsPage from './pages/TouchpointsPage';
import FollowupsPage from './pages/FollowupsPage';
import ReportsPage from './pages/ReportsPage';
import AdminPage from './pages/AdminPage';
import RolesPage from './pages/admin/RolesPage';
import PermissionsPage from './pages/admin/PermissionsPage';
import UsersPage from './pages/admin/UsersPage';
import ForbiddenPage from './pages/ForbiddenPage';
import { Spin } from 'antd';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="patients" element={<PatientsPage />} />
          <Route path="patients/:id" element={<PatientDetailPage />} />
          <Route path="demands" element={<DemandsPage />} />
          <Route path="paths" element={<PathsPage />} />
          <Route path="touchpoints" element={<TouchpointsPage />} />
          <Route path="followups" element={<FollowupsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="admin" element={<AdminPage />} />
          <Route path="admin/roles" element={<RolesPage />} />
          <Route path="admin/permissions" element={<PermissionsPage />} />
          <Route path="admin/users" element={<UsersPage />} />
          <Route path="forbidden" element={<ForbiddenPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
