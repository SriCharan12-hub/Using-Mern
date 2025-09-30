import React from 'react';
import Cookies from 'js-cookie';
import { Navigate } from 'react-router-dom';

const AdminProtectedRoute = ({ children }) => {
  const jwtToken = Cookies.get('jwttoken');
  const userEmail = Cookies.get('userEmail');

  const isAdmin = (userEmail === 'SriCharan@gmail.com') ||  (userEmail === 'sricharanpalem07@gmail.com');
  if (jwtToken === undefined ) {
    return <Navigate to="/login" />; 
  }
  if (!isAdmin){
    return <Navigate to="/homepage" />; 

  }

  return children;
};

export default AdminProtectedRoute;