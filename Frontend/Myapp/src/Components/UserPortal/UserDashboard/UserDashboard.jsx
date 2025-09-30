import React from 'react';
import styles from './UserDashboard.module.css';
import { Outlet, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie'
import Confirmlogout from '../../Navbar/Confirmlogout/Confirmlogout';


// const recentOrdersData = [
//   {
//     id: '#123456',
//     date: 'July 15, 2024',
//     status: 'Shipped',
//     total: '120.00',
//   },
//   {
//     id: '#123457',
//     date: 'July 10, 2024',
//     status: 'Delivered',
//     total: '85.00',
//   },
//   {
//     id: '#123458',
//     date: 'June 28, 2024',
//     status: 'Cancelled',
//     total: '50.00',
//   },
// ];

// const wishlistData = [
//   {
//     name: 'Summer Dress',
//     price: 49.99,
//     image: 'https://placehold.co/100x100/ADD8E6/FFFFFF?text=Dress',
//   },
//   {
//     name: 'Wireless Headphones',
//     price: 79.99,
//     image: 'https://placehold.co/100x100/C0E8D9/FFFFFF?text=Headphones',
//   },
//   {
//     name: 'Leather Handbag',
//     price: 129.99,
//     image: 'https://placehold.co/100x100/A0B2C4/FFFFFF?text=Handbag',
//   },
// ];

const UserDashboard = ({showConfirm,setShowConfirm}) => {
  // const getStatusClass = (status) => {
  //   switch (status) {
  //     case 'Shipped':
  //       return 'status-shipped';
  //     case 'Delivered':
  //       return 'status-delivered';
  //     case 'Cancelled':
  //       return 'status-cancelled';
  //     default:
  //       return '';
  //   }
  // };


  function handleLogoutConfirm(){
      Cookies.remove("jwttoken");
      Cookies.remove("username")
      Cookies.remove("userEmail")
      effectiveSetShowConfirm(false);
      navigate('/login');
          
      }
  function handleLogoutCancel(){
    effectiveSetShowConfirm(false)

  }
  function functionLogout(){
    effectiveSetShowConfirm(true)
  }

  const navigate = useNavigate()
  const username = Cookies.get('username')
   const [localShowConfirm, setLocalShowConfirm] = React.useState(false)
    const effectiveShowConfirm = typeof showConfirm === 'boolean' ? showConfirm : localShowConfirm
    const effectiveSetShowConfirm = typeof setShowConfirm === 'function' ? setShowConfirm : setLocalShowConfirm



  return (
    <div className={styles["dashboard-page"]}>
      <div className={styles["sidebar"]}>
         {/* <button 
                    onClick={() => navigate('/homepage')}
                    style={{
                        color: 'white',
                        backgroundColor: "purple",
                        padding: "10px",
                        borderRadius: "5px",
                        borderWidth: "0px",
                        cursor: "pointer",
                        height: "40px",
                        width: "70px",
                        alignSelf: "flex-start"
                    }}
                >
                    Back
                </button> */}

        <div className={styles["user-info"]}>
          <div className={styles["user-avatar"]}></div>
          <div className={styles["user-details"]}>
            <span className={styles["user-name"]}>{username}</span>

          </div>
        </div>

        <nav className={styles["nav-menu"]}>

          {/* <a href="#" className="nav-item">
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="#7f8c8d"/>
            </svg>
            Orders
          </a> */}
          <a  className={`${styles["nav-item"]}`} onClick={()=>navigate('wishlist')}>
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 18C17.5523 18 18 17.5523 18 17C18 16.4477 17.5523 16 17 16C16.4477 16 16 16.4477 16 17C16 17.5523 16.4477 18 17 18Z" fill="#7f8c8d"/>
              <path d="M1 4H4.25L6.68 15.69C6.83618 16.4527 7.23468 17.1528 7.82869 17.6534C8.4227 18.154 9.17637 18.4243 9.9475 18.42C10.7186 18.4157 11.4705 18.1408 12.0638 17.6369C12.6571 17.133 13.0543 16.4293 13.208 15.66L15.42 5H21V7H17.3L15.93 12.98C15.8016 13.5658 15.4414 14.0954 14.9084 14.4842C14.3754 14.8731 13.7027 15.0984 13.0075 15.11C12.3123 15.1216 11.626 14.9257 11.0287 14.5492C10.4314 14.1727 9.9575 13.6309 9.67 12.98L7.49 4H1" stroke="#7f8c8d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M8 18C8.55228 18 9 17.5523 9 17C9 16.4477 8.55228 16 8 16C7.44772 16 7 16.4477 7 17C7 17.5523 7.44772 18 8 18Z" fill="#7f8c8d"/>
            </svg>
            Wishlist
          </a>
          <a className={styles["nav-item"]} onClick={()=>navigate('userdetails')}>
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="#7f8c8d" />
              <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="#7f8c8d" />
            </svg>
            UserDetails
          </a>
          {/* <a href="#" className="nav-item">
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="#7f8c8d" />
              <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="#7f8c8d" />
            </svg>
            Addresses
          </a> */}
          {/* <a href="#" className="nav-item">
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="#7f8c8d" />
              <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="#7f8c8d" />
            </svg>
            Security
          </a> */}
        </nav>

        <a href="#" className={styles["nav-item"] + " " + styles["logout"]} onClick={functionLogout}>
          <svg className="nav-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 16L21 12L17 8M21 12H9M11 20H4C3.44772 20 3 19.5523 3 19V5C3 4.44772 3.44772 4 4 4H11" stroke="#7f8c8d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Logout
        </a>
      </div>

      <div className={styles["main-content"]}>
        <Outlet />
      </div>

      {effectiveShowConfirm && (
        <Confirmlogout
          onLogout={handleLogoutConfirm}
          onCancel={handleLogoutCancel}
        />)}
    </div>
  );
};

export default UserDashboard;