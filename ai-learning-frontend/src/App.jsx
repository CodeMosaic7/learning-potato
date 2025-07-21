import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx'
import Dashboard from './pages/Dashboard';
import './index.css'
// import Login from "./pages/Login.jsx"
import Chatbot from './pages/Chatbot.jsx';
import AuthComponent from './components/AuthComponent.jsx';
import HomeWorkHelper from './pages/HomeWorkHelper.jsx';
import Quiz from './pages/Quiz.jsx';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={< Home/>} />
        <Route path="/login" element={< AuthComponent/>} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/chatbot" element={<Chatbot/>} />
        <Route path="/HomeWorkHelper" element={<HomeWorkHelper/>} />
        <Route path="/Quiz" element={<Quiz/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
