import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import InstructorDashboard from './pages/InstructorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdvisorDashboard from './pages/AdvisorDashboard';

function RoleRoute() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;

  switch (user.role) {
    case 'student':    return <Navigate to="/student" />;
    case 'instructor': return <Navigate to="/instructor" />;
    case 'admin':      return <Navigate to="/admin" />;
    case 'advisor':    return <Navigate to="/advisor" />;
    default:           return <Navigate to="/login" />;
  }
}

function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<RoleRoute />} />

        <Route path="/student" element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentDashboard />
          </ProtectedRoute>
        } />

        <Route path="/instructor" element={
          <ProtectedRoute allowedRoles={['instructor']}>
            <InstructorDashboard />
          </ProtectedRoute>
        } />

        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        <Route path="/advisor" element={
          <ProtectedRoute allowedRoles={['advisor']}>
            <AdvisorDashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
