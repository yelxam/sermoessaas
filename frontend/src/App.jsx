import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateSermon from './pages/CreateSermon';
import SermonList from './pages/SermonList';
import SermonDetail from './pages/SermonDetail';
import Team from './pages/Team';
import Organization from './pages/Organization';
import Plans from './pages/Plans';
import LandingPage from './pages/LandingPage';

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
    return (
        <ThemeProvider>
            <LanguageProvider>
                <Router>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/dashboard" element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        } />

                        <Route path="/sermons" element={
                            <ProtectedRoute>
                                <SermonList />
                            </ProtectedRoute>
                        } />

                        <Route path="/sermons/new" element={
                            <ProtectedRoute>
                                <CreateSermon />
                            </ProtectedRoute>
                        } />

                        <Route path="/sermons/:id" element={
                            <ProtectedRoute>
                                <SermonDetail />
                            </ProtectedRoute>
                        } />

                        <Route path="/team" element={
                            <ProtectedRoute>
                                <Team />
                            </ProtectedRoute>
                        } />

                        <Route path="/organization" element={
                            <ProtectedRoute>
                                <Organization />
                            </ProtectedRoute>
                        } />

                        <Route path="/plans" element={
                            <ProtectedRoute>
                                <Plans />
                            </ProtectedRoute>
                        } />

                    </Routes>
                </Router>
            </LanguageProvider>
        </ThemeProvider>
    );
}

export default App;
