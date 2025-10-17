import './AdminDashboard.css';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import Confirmlogout from '../../Navbar/Confirmlogout/Confirmlogout';
import { useState } from 'react';
import UserOrders from '../UserOrders/UserOrders';
import AdminDetails from '../AdminDetails/AdminDetails';
import AdminAnalytics from '../AdminAnalytical/AdminAnalytical';
import FeedbackResponse from '../../Feedback/FeedbackResponse';


const AdminDashboard = ({showConfirm, setShowConfirm}) => {
  const navigate = useNavigate();
  const username = Cookies.get('username') || 'Admin';
  const [localShowConfirm, setLocalShowConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState('orders');
  
  const effectiveShowConfirm = typeof showConfirm === 'boolean' ? showConfirm : localShowConfirm;
  const effectiveSetShowConfirm = typeof setShowConfirm === 'function' ? setShowConfirm : setLocalShowConfirm;

  function handleLogoutConfirm(){
    Cookies.remove("jwttoken");
    Cookies.remove("username");
    Cookies.remove("userEmail");
    effectiveSetShowConfirm(false);
    navigate('/login');
  }
  
  function handleLogoutCancel(){
    effectiveSetShowConfirm(false);
  }
  
  function functionLogout(){
    effectiveSetShowConfirm(true);
  }

  const renderContent = () => {
    switch(activeTab) {
      case 'orders':
        return <UserOrders />;
      case 'admindetails':
        return <AdminDetails />;
      case 'analytics':
        return <AdminAnalytics/>
      case 'feedback':
        return <FeedbackResponse />
      default:
        return <UserOrders />;
    }
  };

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <div className="user-info">
          <div className="user">
            <img 
              src="https://img.freepik.com/free-vector/smiling-redhaired-boy-illustration_1308-176664.jpg"
              style={{ height: "50px" }}
              alt="Admin Avatar"
            />
          </div>
          <div className="user-details">
            <span className="user-name">{username}</span>
          </div>
        </div>

        <nav className="nav-menu">
          <a 
            className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`} 
            onClick={() => setActiveTab('orders')}
          >
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 7H4C2.9 7 2 7.9 2 9V19C2 20.1 2.9 21 4 21H20C21.1 21 22 20.1 22 19V9C22 7.9 21.1 7 20 7Z" stroke="#7f8c8d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 7V5C16 3.9 15.1 3 14 3H10C8.9 3 8 3.9 8 5V7" stroke="#7f8c8d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            User Orders
          </a>

          <a 
            className={`nav-item ${activeTab === 'admindetails' ? 'active' : ''}`} 
            onClick={() => setActiveTab('admindetails')}
          >
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="#7f8c8d" />
              <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="#7f8c8d" />
            </svg>
            Admin Details
          </a>

          <a 
            className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`} 
            onClick={() => setActiveTab('analytics')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="nav-icon">
              <path fillRule="evenodd" d="M3 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6Zm4.5 7.5a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0v-2.25a.75.75 0 0 1 .75-.75Zm3.75-1.5a.75.75 0 0 0-1.5 0v4.5a.75.75 0 0 0 1.5 0V12Zm2.25-3a.75.75 0 0 1 .75.75v6.75a.75.75 0 0 1-1.5 0V9.75A.75.75 0 0 1 13.5 9Zm3.75-1.5a.75.75 0 0 0-1.5 0v9a.75.75 0 0 0 1.5 0v-9Z" clipRule="evenodd" />
            </svg>
            Analytics
          </a>

          <a 
            className={`nav-item ${activeTab === 'feedback' ? 'active' : ''}`} 
            onClick={() => setActiveTab('feedback')}
          >
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" stroke="#7f8c8d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 9H17M7 13H13" stroke="#7f8c8d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Feedback Response
          </a>
        </nav>

        <a href="#" className="nav-item logout" onClick={functionLogout}>
          <svg className="nav-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 16L21 12L17 8M21 12H9M11 20H4C3.44772 20 3 19.5523 3 19V5C3 4.44772 3.44772 4 4 4H11" stroke="#7f8c8d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Logout
        </a>
      </div>

      <div className="main-content">
        {renderContent()}
      </div>

      {effectiveShowConfirm && (
        <Confirmlogout
          onLogout={handleLogoutConfirm}
          onCancel={handleLogoutCancel}
        />
      )}
    </div>
  );
};

export default AdminDashboard;