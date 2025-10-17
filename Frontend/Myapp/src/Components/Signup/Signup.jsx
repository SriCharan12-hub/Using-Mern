import React, { useState } from "react";
import "./Signup.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import Cookies from "js-cookie";

const SignupPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password || !confirmPassword) {
      setError("Please fill in all the details.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/register`, {
        email,
        username,
        password,
        confirmPassword,
      });

      console.log("Registration successful:", response.data);

      if (response.status === 201) {
        setUsername("");
        setPassword("");
        setConfirmPassword("");
        setEmail("");
        navigate("/login");
      }
    } catch (err) {
      console.error("Registration failed:", err);
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <h2>Create Account</h2>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="username"></label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
            />
          </div>

          <div className="input-group">
            <label htmlFor="email"></label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>

          <div className="input-group password-container">
            <label htmlFor="password"></label>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
            <span className="password-toggle" onClick={togglePasswordVisibility}>
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>

          <div className="input-group password-container">
            <label htmlFor="confirm-password"></label>
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
            />
            <span
              className="password-toggle"
              onClick={toggleConfirmPasswordVisibility}
            >
              {showConfirmPassword ? "🙈" : "👁️"}
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
                const res = await axios.post(
                  `${import.meta.env.VITE_API_URL}/login/google`,
                  { idToken }
                );
                const { jwttoken, result } = res.data;

                if (result.email === "sricharanpalem07@gmail.com") {
                  Cookies.set("jwttoken", jwttoken, { path: "/" });
                  Cookies.set("userEmail", result.email, { path: "/" });
                  navigate("/admin/products");
                } else {
                  Cookies.set("username", result.username, { path: "/" });
                  Cookies.set("jwttoken", jwttoken, { path: "/" });
                  navigate("/homepage");
                }

                setEmail("");
                setPassword("");
              } catch (err) {
                console.error("Google login backend failed", err);
              }
            }}
            onError={() => {
              console.log("Google login failed");
            }}
            auto_select={true}
          />
        </div>

        <p className="terms-privacy-text">
          By creating an account, you agree to our{" "}
          <a href="#">Terms</a> and <a href="#">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
};

export default SignupPage;


































































































/*
import React from 'react';
import './Signup.css';
import { FiUser, FiLock, FiMail } from 'react-icons/fi';
import { Link } from 'react-router-dom';

export default function Signup() {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Add your signup logic here
    console.log('Signup submitted');
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <div className="curved-shape"></div>
        <div className="curved-shape2"></div>
        
        <div className="signup-box">
        
          <div className="info-content signup-info">
            <h2 className="animation" style={{ '--li': 17, '--S': 0 }}>
              WELCOME!
            </h2>
            <p className="animation" style={{ '--li': 18, '--S': 1 }}>
              We're delighted to have you here. If you need any assistance, feel
              free to reach out.
            </p>
          </div>

   
          <div className="form-box signup-form">
            <h2 className="animation" style={{ '--li': 17, '--S': 0 }}>
              Register
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="input-box animation" style={{ '--li': 18, '--S': 1 }}>
                <input type="text" required />
                <label>Username</label>
                <FiUser className="icon" />
              </div>
              <div className="input-box animation" style={{ '--li': 19, '--S': 2 }}>
                <input type="email" required />
                <label>Email</label>
                <FiMail className="icon" />
              </div>
              <div className="input-box animation" style={{ '--li': 20, '--S': 3 }}>
                <input type="password" required />
                <label>Password</label>
                <FiLock className="icon" />
              </div>
              <div className="input-box animation" style={{ '--li': 21, '--S': 4 }}>
                <button className="btn" type="submit">
                  Register
                </button>
              </div>
              <div className="regi-link animation" style={{ '--li': 22, '--S': 5 }}>
                <p>
                  Already have an account? <br />
                  <Link to="/login" className="login-link">
                    Sign In
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}*/