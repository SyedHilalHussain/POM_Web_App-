// PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
    const isAuthenticated = !!localStorage.getItem('access_token');  // Check if the user is authenticated

    return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
