import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import EntityPage from './pages/EntityPage';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import AdminWorkspace from './pages/AdminWorkspace';
import ScheduledDispatcher from './components/ScheduledDispatcher';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <ScheduledDispatcher />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/admin/workspace" element={<ProtectedRoute><AdminWorkspace /></ProtectedRoute>} />
            <Route path="/sprint-board" element={<ProtectedRoute><AdminWorkspace /></ProtectedRoute>} />

            {/* Generic CRUD modules: leads, contacts, accounts, deals, tasks,
                appointments, products, invoices, campaigns, tickets */}
            <Route path="/:entity" element={<ProtectedRoute><EntityPage /></ProtectedRoute>} />

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
