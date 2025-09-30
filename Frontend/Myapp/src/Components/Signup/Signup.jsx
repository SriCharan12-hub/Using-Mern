import React, { useState } from 'react';
import './Signup.css';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { GoogleLogin } from '@react-oauth/google';
import Cookies from 'js-cookie';

const SignupPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false); // New state for password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // New state for confirm password visibility

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password || !confirmPassword) {
      setError('Please fill in all the details.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/register', {
        email,
        username,
        password,
        confirmPassword,
      });
      console.log('Registration successful:', response.data);
      if (response.status === 201) {
        setUsername('');
        setPassword('');
        setConfirmPassword('');
        setEmail('');
        navigate('/login');
      }
    } catch (error) {
      console.log(error);
      if (error.response) {
        setError(error.response.data.message || "Something went wrong");
      } else if (error.request) {
        setError("No response from server. Please try again.");
      } else {
        setError("Unexpected error occurred");
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prevShowPassword => !prevShowPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(prevShowPassword => !prevShowPassword);
  };

  return (
    <div className="signup-page">
      <nav className="navbar">
        <div className="logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 12H7V22H17V12H22L12 2ZM12 4.828L19.172 12H14V20H10V12H4.828L12 4.828Z" fill="#185A9D" />
          </svg>
          Trendify
        </div>
        <div className="nav-actions">
          <a className="sign-in-link" onClick={() => { navigate('/login') }}>Sign In</a>
        </div>
      </nav>

      <div className="signup-container">
        <div className="signup-card">
          <div className="header-text">
            <h2>Create your account</h2>
            <p>Already have an account? <a className="sign-in-link-text" style={{ cursor: "pointer" }} onClick={() => { navigate('/login') }}>Sign in</a></p>
          </div>
          
          <form className="signup-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="name"></label>
              <input 
                type="text" 
                id="name" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter Username"
              />
            </div>
            
            <div className="input-group">
              <label htmlFor="email"></label>
              <input 
                type="text" 
                id="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter Email"
              />
            </div>
            
            <div className="input-group password-container">
              <label htmlFor="password"></label>
              <input 
                type={showPassword ? "text" : "password"} 
                id="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
              />
              <span className="password-toggle" onClick={togglePasswordVisibility}>
                {showPassword ? '🙈' : '👁️'}
              </span>
            </div>
            
            <div className="input-group password-container">
              <label htmlFor="confirm-password"></label>
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                id="confirm-password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Enter confirm password"
              />
              <span className="password-toggle" onClick={toggleConfirmPasswordVisibility}>
                {showConfirmPassword ? '🙈' : '👁️'}
              </span>
            </div>
            
            {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
            
            <button type="submit" className="create-account-btn">
              Create Account
            </button>
          </form>

          <div style={{ marginLeft: "60px", marginTop: "20px" }}>
            <GoogleLogin 
              onSuccess={async (credentialResponse) => {
                try {
                  const idToken = credentialResponse.credential;
                  const res = await axios.post('http://localhost:8000/login/google', { idToken });
                  const { jwttoken, result } = res.data;
                  console.log(result.email);
                  if (result.email === "sricharanpalem07@gmail.com") {
                    console.log("try block executed");
                    Cookies.set("jwttoken", jwttoken, { path: '/' });
                    Cookies.set("userEmail", result.email, { path: '/' });
                    navigate('/admin/products');
                    setEmail("");
                    setPassword("");
                  } else {
                    console.log("catch block", result);
                    Cookies.set('username', result.username, { path: '/' });
                    Cookies.set('jwttoken', jwttoken, { path: '/' });
                    navigate('/homepage');
                  }
                } catch (err) {
                  console.error('Google login backend failed', err);
                }
              }} 
              onError={() => { console.log("login failed") }}
              auto_select={true}>
            </GoogleLogin>
          </div>

          <p className="terms-privacy-text">
            By creating an account, you agree to our <a>Terms</a> and <a>Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;