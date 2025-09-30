import React from 'react';
import './NavSearch.css';
import { useNavigate } from 'react-router-dom';
import Confirmlogout from '../../Navbar/Confirmlogout/Confirmlogout';
import Cookies from 'js-cookie'
// import { useCart } from '../../CartContext';

function NavSearch({ setShowConfirm, showConfirm}) {
  const navigate = useNavigate()

  const [localShowConfirm, setLocalShowConfirm] = React.useState(false)
  // const { totalItems } = useCart(); 
 
  const effectiveShowConfirm = typeof showConfirm === 'boolean' ? showConfirm : localShowConfirm
  const effectiveSetShowConfirm = typeof setShowConfirm === 'function' ? setShowConfirm : setLocalShowConfirm
    function functionCart(){
        navigate('/cart')

    }
  function functionLogout(){
    effectiveSetShowConfirm(true)
  }
    function functionUser(){
        navigate('/userdashboard')
    }
  function handleLogoutCancel(){
    effectiveSetShowConfirm(false)

  }
    function handleLogoutConfirm(){
    Cookies.remove("jwttoken");
    Cookies.remove("username")
    Cookies.remove("userEmail")
    effectiveSetShowConfirm(false);
    navigate('/login');
        
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
          

          {/* New Cart Icon */}
          <div className="cart-icon-wrapper" onClick={functionCart} style={{ position: 'relative' }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="icon">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
            </svg>
        
          </div>


          {/* New User Icon */}
          <svg xmlns="http://www.w3.org/2000/svg" onClick={functionUser} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="icon">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>



          {/* Logout Icon */}
          <svg xmlns="http://www.w3.org/2000/svg" onClick={functionLogout} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="icon">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
          </svg>

        </div>
      </header>
      {effectiveShowConfirm && (
        <Confirmlogout
          onLogout={handleLogoutConfirm}
          onCancel={handleLogoutCancel}
        />)}
    </div>
  );
}

export default NavSearch;