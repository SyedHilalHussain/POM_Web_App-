import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import AppHeader from './components/AppHeader';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import Login from './components/Login';
import Register from './components/Register';
import PrivateRoute from './components/PrivateRoute';
import { Layout } from 'antd';
import { MyContextProvider } from './components/MyContext';

const App = () => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  return (
    <MyContextProvider>
      <Router>
        <Layout style={{ minHeight: '100vh' }}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Private Route for the dashboard */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Layout>
                    <AppHeader onSidebarToggle={setIsSidebarVisible} />
                    <Layout>
                      {isSidebarVisible && <Sidebar />}
                      <MainContent />
                    </Layout>
                  </Layout>
                </PrivateRoute>
              }
            />

            {/* Redirect from the root to login */}
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </Layout>
      </Router>
    </MyContextProvider>
  );
};

export default App;
