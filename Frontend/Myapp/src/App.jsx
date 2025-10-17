import LoginPage from "./Components/Login/Login";
 import SignupPage from "./Components/Signup/Signup";
import EditProduct from "./Components/AdminPortal/EditProduct/EditProduct";
import AddNewProduct from "./Components/AdminPortal/AddProduct/AddProduct";
import ProductsDetails from "./Components/AdminPortal/ProductsDetails/ProductsDetails";
import Checkout from "./Components/UserPortal/CheckoutPage/Checkout";
import ShoppingCart from "./Components/UserPortal/ShoppingCart/ShoppingCart";
import UserDashboard from "./Components/UserPortal/UserDashboard/UserDashboard";
import { Routes, Route } from "react-router-dom";
import HomePage from "./Components/UserPortal/HomePage/HomePage";
import UserProducts from "./Components/UserPortal/UserProducts/UserProducts";
import AdminProtectedRoute from "./AdminProtectedRoute";
import Navbar from "./Components/Navbar/Navbar";
import UserDetails from "./Components/UserDetails/userDetails";
import Wishlist from "./Components/UserPortal/Wishlist/Wishlist";
import MensFashion from "./Components/UserPortal/MensFashion/MensFashion";
import WomensFashion from "./Components/UserPortal/WomensFashion/WomensFashion";
import Accessories from "./Components/UserPortal/Accessories/Accessories";
import AdminDashboard from "./Components/AdminPortal/AdminDashboard/AdminDashboard";
import OrderConfirmed from "./Components/UserPortal/OrderConfirmed/OrderConfirmed";
import AdminNavbar from "./Components/AdminPortal/AdminNavbar/AdminNavbar";

import PageNotFound from "./Components/PageNotFound/PageNotFound";

import Reset from "./Components/ResetPassword/ResetPassword";
import ForgotPassword from "./Components/OtpForm/OtpForm";
import VerifyOtp from "./Components/OtpVerify/OtpVerify";
import Address from "./Components/UserPortal/Address/Address";


import { useState } from "react";
import AdminDetails from "./Components/AdminPortal/AdminDetails/AdminDetails";
import PreviousOrders from "./Components/UserPortal/PreviousOrders/PreviousOrders";
import Feedback from "./Components/Feedback/Feedback";
import FeedbackResponse from "./Components/Feedback/FeedbackResponse";
import UserProtectedRoute from "./UserProtectedRoute";
import AdminAnalytics from "./Components/AdminPortal/AdminAnalytical/AdminAnalytical";
import Footer from "./Components/Footer/Footer";
import { useLocation } from "react-router-dom";
import ProductDetailView from "./Components/UserPortal/ProductDetailedView/ProductDetailedView";

function App() {
  const [showConfirm, setShowConfirm] = useState(false);
  const location = useLocation()

    const hideNavFooterPaths = [
    "/login",
    "/",
    "/forgot",
    "/verify",
    "/reset",
    "/cart"
  ];
    const hideNavFooter = hideNavFooterPaths.includes(location.pathname)

  
  return(
    <>

  
   {
  location.pathname !== '/login' && 
  location.pathname !== '/' && (
    location.pathname.includes('/admin')
      ? <AdminNavbar showConfirm={showConfirm} setShowConfirm={setShowConfirm} />
      : <Navbar showConfirm={showConfirm} setShowConfirm={setShowConfirm} />
  )
}


   


  <Routes>
      <Route path='/' element={<SignupPage />}></Route>

      <Route path='/login' element={<LoginPage/>}></Route>

      <Route path='/forgot' element={<ForgotPassword/>}></Route>

      <Route path='/verify' element={<VerifyOtp/>}></Route>

      <Route path='/reset' element={<Reset/>}></Route>
    

      <Route path='/cart' element={<UserProtectedRoute><ShoppingCart/></UserProtectedRoute>}></Route>

      <Route path='/userdashboard' element={<UserProtectedRoute><UserDashboard showConfirm={showConfirm} setShowConfirm={setShowConfirm}/></UserProtectedRoute>}>
        <Route index element={<h2>User Dashboard Overview</h2>} />
        <Route path="wishlist" element={<Wishlist />} />
        <Route path="userdetails" element={<UserDetails />} />
      </Route>

      <Route path='/checkout' element={<UserProtectedRoute><Checkout/></UserProtectedRoute>}></Route>

      {/* <Route path='/wishlist' element={<UserProtectedRoute><Wishlist/></UserProtectedRoute>}></Route> */}

      <Route path='/orderconfirmed' element={<UserProtectedRoute><OrderConfirmed/></UserProtectedRoute>}></Route>

      {/* <Route path='/navsearch' element={<UserProtectedRoute><NavSearch/></UserProtectedRoute>}></Route> */}

      <Route path='*' element={<UserProtectedRoute><PageNotFound/></UserProtectedRoute>}></Route>

      <Route path='/homepage' element={<UserProtectedRoute><HomePage/></UserProtectedRoute>}></Route>

      <Route path='/userdashboard/orders' element={<UserProtectedRoute><PreviousOrders/></UserProtectedRoute>}></Route>

      <Route path='/userproducts' element={<UserProtectedRoute><UserProducts/></UserProtectedRoute>}></Route>

      {/* <Route path='/userdetails' element={<UserProtectedRoute><UserDetails/></UserProtectedRoute>}></Route> */}

      <Route path='/mensfashion' element={<UserProtectedRoute><MensFashion/></UserProtectedRoute>}></Route>

      <Route path='/womensfashion' element={<UserProtectedRoute><WomensFashion/></UserProtectedRoute>}></Route>

      <Route path='/accessories' element={<UserProtectedRoute><Accessories/></UserProtectedRoute>}></Route>

      <Route path='/address' element={<UserProtectedRoute><Address/></UserProtectedRoute>}></Route>

  <Route path="/product/:productId" element={<UserProtectedRoute><ProductDetailView/></UserProtectedRoute>}></Route>

  <Route path="/feedback" element={<UserProtectedRoute><Feedback /></UserProtectedRoute>}></Route>

     

      {/* <Route path='/navbar' element={<Navbar/>} showConfirm={showConfirm} setShowConfirm={setShowConfirm}></Route>   */}
      












 <Route path='/admin/products' element={<AdminProtectedRoute><ProductsDetails/></AdminProtectedRoute>}></Route>

      <Route path='/admin/add-product' element={<AdminProtectedRoute><AddNewProduct/></AdminProtectedRoute>}></Route>

      <Route path='/admin/edit-product' element={<AdminProtectedRoute><EditProduct /></AdminProtectedRoute>}></Route>

       <Route path="/admin/dashboard" element={<AdminProtectedRoute showConfirm={showConfirm} setShowConfirm={setShowConfirm}><AdminDashboard /></AdminProtectedRoute>}>
       <Route index element={<h2>Admin Dashboard Overview</h2>} />
        <Route path="details" element={<AdminDetails />} />
        </Route>

      {/* <Route path='/adminnavbar' element={<AdminProtectedRoute><AdminNavbar/></AdminProtectedRoute>}></Route> */}

      <Route path='/admin/admin-details' element={<AdminProtectedRoute><AdminDetails/></AdminProtectedRoute>}></Route>

      <Route path='/admin/adminanalytics' element={<AdminProtectedRoute><AdminAnalytics/></AdminProtectedRoute>}></Route>

      <Route path='/admin/feedback' element={<AdminProtectedRoute><FeedbackResponse/></AdminProtectedRoute>}></Route>

  </Routes>
  {!hideNavFooter && <Footer />}
    </>
  )
}

export default App;
