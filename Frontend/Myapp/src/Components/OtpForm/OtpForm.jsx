
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './OtpForm.css'; 

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/forgot-password`, { email });
      if (!email.endsWith("@gmail.com")) {
        return setMessage("Please use a valid Gmail address.");
      }
      

      setMessage(res.data.message || "OTP sent successfully. Check your email.");
      
      if (res.status === 200) {
        setTimeout(() => {
          navigate('/verify'); // Navigate to OTP verification page
        }, 2000);
      }

    } catch (err) {
      const errorMsg = err.response?.data?.error || "Error sending OTP. Please try again.";
      setMessage(errorMsg);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="forgot-password-page-container"> 
    <button onClick={()=>navigate('/login')} className="Verify-back">Back</button>
      <div className="forgot-password-card"> 
        <h2 className="forgot-password-header">Forgot Password</h2>
        <p className="forgot-password-subtext">
            Enter your email to receive an OTP to reset your password.
        </p>
        
        <form onSubmit={handleSubmit} className="forgot-password-form">
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
          
          <button 
            className="submit-button" 
            type="submit" 
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send OTP'}
          </button>
        </form>
        
    
        {message && (
            <p className="error" style={{color:"red",textAlign:"center"}}>
                {message}
            </p>
        )}

      </div>
    </div>
  );
}