import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import UploadResume from './pages/UploadResume';
import JobDescription from './pages/JobDescription';
import AnalysisResult from './pages/AnalysisResult';
import ResumeEditor from './pages/ResumeEditor';
import PreviousReports from './pages/PreviousReports';
import CoverLetterGenerator from './pages/CoverLetterGenerator';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/upload" element={
              <ProtectedRoute>
                <UploadResume />
              </ProtectedRoute>
            } />
            <Route path="/job-description" element={
              <ProtectedRoute>
                <JobDescription />
              </ProtectedRoute>
            } />
            <Route path="/analysis/:id" element={
              <ProtectedRoute>
                <AnalysisResult />
              </ProtectedRoute>
            } />
            <Route path="/editor/:id" element={
              <ProtectedRoute>
                <ResumeEditor />
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute>
                <PreviousReports />
              </ProtectedRoute>
            } />
            <Route path="/cover-letter" element={
              <ProtectedRoute>
                <CoverLetterGenerator />
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
