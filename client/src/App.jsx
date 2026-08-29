import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';

// Pages
import Home from './pages/Home';
import Tournaments from './pages/Tournaments';
import TournamentDetail from './pages/TournamentDetail';
import LiveCenter from './pages/LiveCenter';
import PlayerDashboard from './pages/PlayerDashboard';
import OrganizerDashboard from './pages/OrganizerDashboard';
import CreateTournament from './pages/CreateTournament';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminOrganizers from './pages/admin/AdminOrganizers';
import AdminTournaments from './pages/admin/AdminTournaments';
import AdminEditTournament from './pages/admin/AdminEditTournament';
import AdminRegistrations from './pages/admin/AdminRegistrations';
import AdminReports from './pages/admin/AdminReports';
import AdminActivity from './pages/admin/AdminActivity';
import AdminSettings from './pages/admin/AdminSettings';
import ErrorBoundary from './components/ErrorBoundary';
import CustomCursor from './components/CustomCursor';
import DynamicBackground from './components/DynamicBackground';

import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <Router>
            <CustomCursor />
            <DynamicBackground />
            <div className="relative z-10 flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-600 selection:text-white">
              {/* Top Navbar */}
              <Navbar />

            {/* Main Page Body */}
            <main className="flex-grow">
              <ErrorBoundary>
                <Routes>
                {/* Public Spectator Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/tournaments" element={<Tournaments />} />
                <Route path="/tournaments/:id" element={<TournamentDetail />} />
                <Route path="/live" element={<LiveCenter />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />

                {/* Common Protected Profile Route */}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />

                {/* Player Protected Routes */}
                <Route
                  path="/player-dashboard"
                  element={
                    <ProtectedRoute>
                      <PlayerDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Organizer Protected Routes */}
                <Route
                  path="/organizer-dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['ORGANIZER', 'ADMIN']}>
                      <OrganizerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/create-tournament"
                  element={
                    <ProtectedRoute allowedRoles={['ORGANIZER', 'ADMIN']}>
                      <CreateTournament />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Protected Routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="organizers" element={<AdminOrganizers />} />
                  <Route path="tournaments" element={<AdminTournaments />} />
                  <Route path="tournaments/:id/edit" element={<AdminEditTournament />} />
                  <Route path="registrations" element={<AdminRegistrations />} />
                  <Route path="reports" element={<AdminReports />} />
                  <Route path="activity" element={<AdminActivity />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              </ErrorBoundary>
            </main>

            {/* Footer */}
            <Footer />
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
