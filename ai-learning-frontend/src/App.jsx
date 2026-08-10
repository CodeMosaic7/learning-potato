import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Dashboard from './pages/Dashboard';
import './index.css';
import Chatbot from './pages/Chatbot.jsx';
import AuthComponent from './components/AuthComponent.jsx';
import HomeWorkHelper from './pages/HomeWorkHelper.jsx';
import Quiz from './pages/Quiz.jsx';
import Roadmap from './pages/Roadmap.jsx';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<AuthComponent />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chatbot"
            element={
              <ProtectedRoute>
                <Chatbot />
              </ProtectedRoute>
            }
          />
          <Route
            path="/HomeWorkHelper"
            element={
              <ProtectedRoute>
                <HomeWorkHelper />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Quiz"
            element={
              <ProtectedRoute>
                <Quiz />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Roadmap"
            element={
              <ProtectedRoute>
                <Roadmap />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
