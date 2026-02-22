import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Preferences from './pages/Preferences';
import TestPage from './pages/TestPage';
import Result from './pages/Result';
import './App.css';

function PrivateRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/preferences" element={<PrivateRoute><Preferences /></PrivateRoute>} />
      <Route path="/test/:stream" element={<PrivateRoute><TestPage /></PrivateRoute>} />
      <Route path="/result" element={<PrivateRoute><Result /></PrivateRoute>} />
    </Routes>
  );
}

export default App;
