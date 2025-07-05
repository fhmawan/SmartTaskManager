import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import DashboardLayout from './components/Layout/DashboardLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import TasksPage from './pages/TasksPage';
import AddTaskPage from './pages/AddTaskPage';
import CategoriesPage from './pages/CategoriesPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/login" />} />
      <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/login" />} />
      
      <Route path="/" element={isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" />}>
        <Route index element={<HomePage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="tasks/new" element={<AddTaskPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
