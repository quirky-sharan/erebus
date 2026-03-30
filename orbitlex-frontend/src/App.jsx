import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { CustomCursor } from './components/CustomCursor';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SignUp from './pages/SignUp';
import Search from './pages/Search';
import Compliance from './pages/Compliance';
import Deorbit from './pages/Deorbit';
import Debris from './pages/Debris';
import Report from './pages/Report';
import Waste from './pages/Waste';

import { Layout } from './components/Layout';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          
          <Route 
            path="/search" 
            element={
              <ProtectedRoute>
                <Layout><Search /></Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Layout><Dashboard /></Layout>
              </ProtectedRoute>
            } 
          />
          <Route
            path="/compliance"
            element={
              <ProtectedRoute>
                <Layout><Compliance /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/deorbit"
            element={
              <ProtectedRoute>
                <Layout><Deorbit /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/debris"
            element={
              <ProtectedRoute>
                <Layout><Debris /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/report"
            element={
              <ProtectedRoute>
                <Layout><Report /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/waste"
            element={
              <ProtectedRoute>
                <Layout><Waste /></Layout>
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Placeholder for missing routes */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
