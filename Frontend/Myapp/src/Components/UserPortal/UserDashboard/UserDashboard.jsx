import React, { useState } from 'react';
import styles from './UserDashboard.module.css';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import Confirmlogout from '../../Navbar/Confirmlogout/Confirmlogout';
import PreviousOrders from '../PreviousOrders/PreviousOrders';
import Wishlist from '../Wishlist/Wishlist';
import UserDetails from '../../UserDetails/userDetails';

const UserDashboard = ({showConfirm, setShowConfirm}) => {
  const navigate = useNavigate();
  const username = Cookies.get('username');
  const [localShowConfirm, setLocalShowConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState('orders'); // Default to orders view
  
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

  // Render content based on active tab
  const renderContent = () => {
    switch(activeTab) {
      case 'orders':
        return <PreviousOrders />;
      case 'wishlist':
        // pass onClose so Wishlist can tell the dashboard to switch tabs
        return <Wishlist onClose={() => setActiveTab('orders')} />;
      case 'userdetails':
        return <UserDetails />;
      default:
        return <PreviousOrders />;
    }
  };

  return (
    <div className={styles["dashboard-page"]}>
      <div className={styles["sidebar"]}>
        <div className={styles["user-info"]}>
          <div className={styles["user-avatar"]}></div>
          <div className={styles["user-details"]}>
            <span className={styles["user-name"]}>{username}</span>
          </div>
        </div>

        <nav className={styles["nav-menu"]}>
          {/* My Orders Link */}
          <a 
            className={`${styles["nav-item"]} ${activeTab === 'orders' ? styles["active"] : ''}`} 
            onClick={() => setActiveTab('orders')}
          >
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 7H4C2.9 7 2 7.9 2 9V19C2 20.1 2.9 21 4 21H20C21.1 21 22 20.1 22 19V9C22 7.9 21.1 7 20 7Z" stroke="#7f8c8d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 7V5C16 3.9 15.1 3 14 3H10C8.9 3 8 3.9 8 5V7" stroke="#7f8c8d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            My Orders
          </a>

          {/* Wishlist Link */}
          <a 
            className={`${styles["nav-item"]} ${activeTab === 'wishlist' ? styles["active"] : ''}`} 
            onClick={() => setActiveTab('wishlist')}
          >
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20.84 4.61C20.3292 4.099 19.7228 3.69365 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69365 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.57831 8.50903 2.99871 7.05 2.99871C5.59096 2.99871 4.19169 3.57831 3.16 4.61C2.1283 5.64169 1.54871 7.04096 1.54871 8.5C1.54871 9.95903 2.1283 11.3583 3.16 12.39L4.22 13.45L12 21.23L19.78 13.45L20.84 12.39C21.351 11.8792 21.7563 11.2728 22.0329 10.6054C22.3095 9.93789 22.4518 9.22248 22.4518 8.5C22.4518 7.77752 22.3095 7.0621 22.0329 6.39464C21.7563 5.72718 21.351 5.12075 20.84 4.61Z" stroke="#7f8c8d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Wishlist
          </a>

          {/* User Details Link */}
          <a 
            className={`${styles["nav-item"]} ${activeTab === 'userdetails' ? styles["active"] : ''}`} 
            onClick={() => setActiveTab('userdetails')}
          >
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="#7f8c8d" />
              <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="#7f8c8d" />
            </svg>
            User Details
          </a>
        </nav>

        <a href="#" className={styles["nav-item"] + " " + styles["logout"]} onClick={functionLogout}>
          <svg className="nav-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 16L21 12L17 8M21 12H9M11 20H4C3.44772 20 3 19.5523 3 19V5C3 4.44772 3.44772 4 4 4H11" stroke="#7f8c8d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Logout
        </a>
      </div>

      <div className={styles["main-content"]}>
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

export default UserDashboard;