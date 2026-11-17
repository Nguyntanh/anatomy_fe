import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import {
  clearAuthSession,
  getStoredUser,
} from './services/api';

function AuthenticatedDashboard() {
  const navigate = useNavigate();
  const user = getStoredUser();
  if (!localStorage.getItem('access_token') || !user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Dashboard
      user={user}
      onLogout={() => {
        clearAuthSession();
        navigate('/login', { replace: true });
      }}
    />
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#F8FAFC]">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<AuthenticatedDashboard />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
