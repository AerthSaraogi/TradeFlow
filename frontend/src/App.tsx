import '@xyflow/react/dist/style.css';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import CreateWorkflow from './workflow/WorkflowBuilder';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Executor from './pages/Executor';
import { isLoggedIn } from './lib/api';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return isLoggedIn() ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/createflow" element={<ProtectedRoute><CreateWorkflow /></ProtectedRoute>} />\n        <Route path="/workflow/:id" element={<ProtectedRoute><CreateWorkflow /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/executor" element={<ProtectedRoute><Executor /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}