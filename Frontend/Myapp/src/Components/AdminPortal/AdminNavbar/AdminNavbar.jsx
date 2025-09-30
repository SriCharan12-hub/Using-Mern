import React from 'react';
import './AdminNavbar.css';
import { useNavigate } from 'react-router-dom';

import Cookies from 'js-cookie'
function AdminNavbar() {
  const navigate = useNavigate()
  // support local state if parent doesn't control the confirm modal

    function functionUser(){
        navigate('/admin/dashboard/details/#')
    }
  
    
  return (
    <div>
      <header className="navbar">
        <div className="brand">
          <svg width="24" height="24" onClick={()=>navigate('/homepage')} style={{cursor:"pointer"}} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 12H7V22H17V12H22L12 2ZM12 4.828L19.172 12H14V20H10V12H4.828L12 4.828Z" fill="#185A9D" />
          </svg>
          <span className="brand-text" onClick={()=>navigate('/homepage')} style={{cursor:"pointer"}}>Trendify</span>
        </div>
        
        <div className="navbar-right">
          
          <svg xmlns="http://www.w3.org/2000/svg" onClick={functionUser} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="icon">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>

        </div>
      </header>
      
    </div>
  );
}

export default AdminNavbar;