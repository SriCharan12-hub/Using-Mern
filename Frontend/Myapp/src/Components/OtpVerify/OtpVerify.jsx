// VerifyOtp.jsx
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './OtpVerify.css'; 
import Cookies from 'js-cookie'

export default function VerifyOtp() {
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false); // Added loading state
  const [isError, setIsError] = useState(false); // State to track error status
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(""); // Clear previous message
    setIsError(false);
    
    try {
    
      const res = await axios.post("http://localhost:8000/verify-otp", { email, pin });
      setMessage(res.data.message || "OTP verified successfully! Redirecting...");

      if (res.status === 200){
        setTimeout(() => {
          Cookies.set('resetmail',email)
          navigate('/reset'); 
        }, 2000);
      }

    } catch (err) {
      const errorMsg = err.response?.data?.error || "Error verifying OTP. Please try again.";
      setMessage(errorMsg);
      setIsError(true);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="verify-otp-page-container"> 
    <button onClick={()=>navigate('/forgot')} style={{color:'white',backgroundColor:"purple",padding:"10px",borderRadius:"5px",borderWidth:"0px",marginRight:"10px",cursor:"pointer"}}>Back</button>
      <div className="verify-otp-card"> 
        <h2 className="verify-otp-header">Verify OTP</h2>
        <p className="verify-otp-subtext">
            Enter the email and the One-Time Pin (OTP) sent to your inbox.
        </p>
        
        <form onSubmit={handleSubmit} className="verify-otp-form">
          <div className="form-group">
            <input
              className="form-input"
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <input
              className="form-input"
              type="text"
              placeholder="Enter 6-digit OTP"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              required
              disabled={loading}
              maxLength={6} // OTPs are typically 6 digits
            />
          </div>
          
          <button 
            className="submit-button" 
            type="submit" 
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </form>
        
        {/* Conditional rendering of the message with proper styling */}
        {message && (
            <p className={`message ${isError ? 'error' : 'success'}`}>
                {message}
            </p>
        )}

      </div>
    </div>
  );
}