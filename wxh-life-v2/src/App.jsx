import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AuthGuard from './components/AuthGuard';
import ToastContainer from './components/ToastContainer';
import { AuthProvider } from './hooks/useAuth';
import { ToastProvider } from './hooks/useToast';
import HallPage from './pages/HallPage';
import LoginPage from './pages/LoginPage';
import GymPage from './pages/gym/GymPage';
import BedroomPage from './pages/bedroom/BedroomPage';
import StudyPage from './pages/study/StudyPage';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/hall" element={<AuthGuard><HallPage /></AuthGuard>} />
            <Route path="/gym/*" element={<AuthGuard><GymPage /></AuthGuard>} />
            <Route path="/study/*" element={<AuthGuard><StudyPage /></AuthGuard>} />
            <Route path="/bedroom/*" element={<AuthGuard><BedroomPage /></AuthGuard>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <ToastContainer />
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
