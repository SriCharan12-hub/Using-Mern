// import './AdminDashboard.css';
// import React from 'react';
// import { useNavigate } from 'react-router-dom';
// import Cookies from 'js-cookie';
// import Confirmlogout from '../../Navbar/Confirmlogout/Confirmlogout';
// // Assuming AdminDetails is rendered through routing in the main content area
// // Or, if used as a child: import AdminDetails from './AdminDetails'; 

// function AdminDashboard({showConfirm, setShowConfirm}) {
//     const navigate = useNavigate();
//     const username = Cookies.get('username') || 'Admin';
//     const [localShowConfirm, setLocalShowConfirm] = React.useState(false);
    
//     // Logic to handle external or local state for the confirmation modal
//     const effectiveShowConfirm = typeof showConfirm === 'boolean' ? showConfirm : localShowConfirm;
//     const effectiveSetShowConfirm = typeof setShowConfirm === 'function' ? setShowConfirm : setLocalShowConfirm;
    
//     function functionLogout(){
//         effectiveSetShowConfirm(true);
//     }

//     function handleLogoutConfirm(){
//         Cookies.remove("jwttoken");
//         Cookies.remove("username");
//         Cookies.remove("userEmail");
//         effectiveSetShowConfirm(false);
//         navigate('/login');
//     }

//     function handleLogoutCancel(){
//         effectiveSetShowConfirm(false);
//     }

//     return (
//         // Main container for the two-column layout
//         <div className="dashboard-container">
            
//             {/* Sidebar (Left Column) */}
//             <div className="sidebar">
//                 <button 
//                     onClick={()=>navigate('/adminproducts')} 
//                     // Adjusted inline style for better integration with CSS
//                     style={{color:'white', backgroundColor:"purple", padding:"10px", borderRadius:"5px", borderWidth:"0px", cursor:"pointer", height:"40px", width:"70px", alignSelf: "flex-start"}}
//                 >
//                     Back
//                 </button>
//                 <div className="user-info">
//                     <div className="user">
//                         <img 
//                             src="https://img.freepik.com/free-vector/smiling-redhaired-boy-illustration_1308-176664.jpg?semt=ais_hybrid&w=740&q=80" 
//                             style={{height:"50px"}} 
//                             alt="Admin Avatar"
//                         />
//                     </div>
//                     <div className="user-details">
//                         <span className="user-name">{username}</span>
//                     </div>
//                 </div>
//                 <nav className="nav-menu">
//                     <a href="#" className="nav-item" onClick={()=>navigate('/admindetails')}>
//                         <svg className="nav-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                             <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="#7f8c8d" />
//                             <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="#7f8c8d" />
//                         </svg>
//                         AdminDetails
//                     </a>
//                 </nav>
//                 <a className="nav-item logout" onClick={functionLogout}>
//                     <svg className="nav-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                         <path d="M17 16L21 12L17 8M21 12H9M11 20H4C3.44772 20 3 19.5523 3 19V5C3 4.44772 3.44772 4 4 4H11" stroke="#7f8c8d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                     </svg>
//                     Logout
//                 </a>
//             </div>

           
//             <div className="main-content">
        
//                 <h2>Admin Dashboard Overview</h2>
                
//             </div>

//             {/* Logout Confirmation Modal */}
//             {effectiveShowConfirm && (
//                 <Confirmlogout
//                     onLogout={handleLogoutConfirm}
//                     onCancel={handleLogoutCancel}
//                 />
//             )}
//         </div>
//     );
// }

// export default AdminDashboard;

import './AdminDashboard.css';
import React from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import Cookies from 'js-cookie';
import Confirmlogout from '../../Navbar/Confirmlogout/Confirmlogout';

function AdminDashboard({ showConfirm, setShowConfirm }) {
    const navigate = useNavigate();
    const username = Cookies.get('username') || 'Admin';
    const [localShowConfirm, setLocalShowConfirm] = React.useState(false);

    const effectiveShowConfirm = typeof showConfirm === 'boolean' ? showConfirm : localShowConfirm;
    const effectiveSetShowConfirm = typeof setShowConfirm === 'function' ? setShowConfirm : setLocalShowConfirm;

    function functionLogout() {
        effectiveSetShowConfirm(true);
    }

    function handleLogoutConfirm() {
        Cookies.remove("jwttoken");
        Cookies.remove("username");
        Cookies.remove("userEmail");
        effectiveSetShowConfirm(false);
        navigate('/login');
    }

    function handleLogoutCancel() {
        effectiveSetShowConfirm(false);
    }

    return (
        <div className="dashboard-container">
            {/* Sidebar */}
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
                    <a href="#" className="nav-item" onClick={() => navigate('details')}>
                        <svg className="nav-icon" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2C6.48 2 2 6.48 2 12..." fill="#7f8c8d" />
                        </svg>
                        AdminDetails
                    </a>
                </nav>

                <a className="nav-item logout" onClick={functionLogout}>
                    <svg className="nav-icon" viewBox="0 0 24 24" fill="none">
                        <path d="M17 16L21 12L17 8M21 12H9..." stroke="#7f8c8d" strokeWidth="2"/>
                    </svg>
                    Logout
                </a>
            </div>

            {/* Main content renders child routes */}
            <div className="main-content">
                <Outlet /> 
            </div>

            {effectiveShowConfirm && (
                <Confirmlogout
                    onLogout={handleLogoutConfirm}
                    onCancel={handleLogoutCancel}
                />
            )}
        </div>
    );
}

export default AdminDashboard;
