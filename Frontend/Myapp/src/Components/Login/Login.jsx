import React, { useState } from 'react';
import './Login.css';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import axios from "axios";

const LoginPage = () => {
  const navigate = useNavigate();
  

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false); // New state for password visibility



  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const verifying = await axios.post(`${import.meta.env.VITE_API_URL}/login`, { email, password });
      
      const userEmail = verifying.data.result.email;
      const token = verifying.data.jwttoken;

      if (verifying.status === 200 && userEmail === 'SriCharan@gmail.com') {
        Cookies.set('jwttoken', token, { path: '/' });
        Cookies.set('userEmail', userEmail, { path: '/' });
        setEmail('');
        setPassword('');
        navigate('/admin/products');
      } else if (verifying.status === 200) {
        Cookies.set('jwttoken', token, { path: '/' });
        Cookies.set('userEmail', userEmail, { path: '/' });
        const username = userEmail.split('@')
        Cookies.set('username',username[0])
        setEmail('');
        setPassword('');
        navigate('/homepage');
      }
    } catch (error) {
      console.log("error", error);
      if (error.response && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("Fill all the details");
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prevShowPassword => !prevShowPassword);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo-container">
          <div className="login-logo"></div>
        </div>
        <h1 className="login-title">Login Portal</h1>
        <p className="login-subtitle">Sign in to manage your store</p>
        
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="text"
              className="login-input"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="input-group password-container">
            <input
              type={showPassword ? "text" : "password"} // Dynamically change the input type
              className="login-input"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span className="password-toggle" onClick={togglePasswordVisibility}>
              {showPassword ? '🙈' : '👁️'}
            </span>
          </div>
          <p style={{color:"blue", textAlign:"left",cursor:"pointer",marginTop:"10px"}} onClick={()=>navigate('/forgot')} >forgot password?</p>
          {error && <p style={{ color: "red" }}>{error}</p>}
          
          <button type="submit" className="sign-in-button">
            Sign In
          </button>
          <p className='text-para'>Don't have an account <span className='registerbtn' style={{ color: "blue", cursor: "pointer" }} onClick={() => { navigate('/') }}>Register</span></p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;


/*import React from 'react';
import './Login.css';
import { FiUser, FiLock } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import axios from "axios";
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';


export default function Login() {
 const navigate = useNavigate();
  

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false); // New state for password visibility



  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const verifying = await axios.post(`${import.meta.env.VITE_API_URL}/login`, { email, password });
      
      const userEmail = verifying.data.result.email;
      const token = verifying.data.jwttoken;

      if (verifying.status === 200 && userEmail === 'SriCharan@gmail.com') {
        Cookies.set('jwttoken', token, { path: '/' });
        Cookies.set('userEmail', userEmail, { path: '/' });
        setEmail('');
        setPassword('');
        navigate('/admin/products');
      } else if (verifying.status === 200) {
        Cookies.set('jwttoken', token, { path: '/' });
        Cookies.set('userEmail', userEmail, { path: '/' });
        const username = userEmail.split('@')
        Cookies.set('username',username[0])
        setEmail('');
        setPassword('');
        navigate('/homepage');
      }
    } catch (error) {
      console.log("error", error);
      if (error.response && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("Fill all the details");
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prevShowPassword => !prevShowPassword);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-content">
          <h2 className="login-title">Login</h2>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
            <input
              type="text"
              className="login-input"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
            <div className="input-group password-container">
            <input
              type={showPassword ? "text" : "password"} // Dynamically change the input type
              className="login-input"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span className="password-toggle" onClick={togglePasswordVisibility}>
              {showPassword ? '🙈' : '👁️'}
            </span>
          </div>
          <p style={{color:"blue", textAlign:"left",cursor:"pointer",marginTop:"10px"}} onClick={()=>navigate('/forgot')} >forgot password?</p>
          {error && <p style={{ color: "red" }}>{error}</p>}
          
          <button type="submit" className="sign-in-button">
            Sign In
          </button>
          <p className='text-para'>Don't have an account <span className='registerbtn' style={{ color: "blue", cursor: "pointer" }} onClick={() => { navigate('/') }}>Register</span></p>
          </form>
        </div>
        <div className="login-info">
          <h2>WELCOME BACK!</h2>
          <p>
            We are happy to have you with us again. If you need anything, we are
            here to help.
          </p>
        </div>
      </div>
      <div className="curved-shape"></div>
      <div className="curved-shape2"></div>
    </div>
  );
}*/