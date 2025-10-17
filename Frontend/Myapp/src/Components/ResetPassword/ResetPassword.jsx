import React, { useState } from "react";
import axios from "axios";
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom'; 

// 🚨 Ensure this CSS file is in the same directory and contains the styles provided earlier
import './ResetPassword.css'; 

export default function ResetPasswordFinal() {
    // 1. Get the email from the cookie, which was likely set after OTP verification
    const email = Cookies.get('resetmail'); 
    
    // State hooks
    const [password, setPassword] = useState('');
    const [confirmpassword, setConfirmPassword] = useState(''); // Note: lowercase 'confirmpassword' to match backend destructuring
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setIsError(false);

        if (!email) {
            setMessage("Error: Reset email is missing. Please restart the password reset process.");
            setIsError(true);
            setLoading(false);
            return;
        }

        if (password !== confirmpassword) {
            setMessage("New Password and Confirm Password don't match.");
            setIsError(true);
            setLoading(false);
            return;
        }
        if (password.length < 3 || password.length > 20) {
            setMessage("Password length should be between 3 and 20 characters.");
            setIsError(true);
            setLoading(false);
            return;
        }

        try {
           
            const backendUrl = `${import.meta.env.VITE_API_URL}/user/resetpassword`; 
            
            
            const res = await axios.put(backendUrl, {
                email,
                password,
                confirmpassword, 
            });

           
            setMessage(res.data.message || "Password updated successfully! Redirecting to login...");
            setIsError(false);
            
        
            Cookies.remove('resetmail'); 

            setTimeout(() => {
                navigate('/login'); 
            }, 3000);

        } catch (err) {
          
            const errorMsg = err.response?.data?.message || "Error updating password. Please try again.";
            setMessage(errorMsg);
            setIsError(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="reset-password-page-container">
             <button onClick={()=>navigate('/verify')} style={{color:'white',backgroundColor:"purple",padding:"10px",borderRadius:"5px",borderWidth:"0px",marginRight:"10px",cursor:"pointer"}}>Back</button>
            <div className="reset-password-card">
                <h2 className="reset-password-header">Reset Password</h2>
                
                {message && (
                    <p className={`message ${isError ? 'error' : 'success'}`}>
                        {message}
                    </p>
                )}
                
                <form onSubmit={handleSubmit} className="reset-password-form">
                    <p className="reset-password-subtext">
                        Setting new password for: 
                        <br/>
                        <strong>{email || "N/A (Please check your browser for cookies)"}</strong>
                    </p>

                    <div className="form-group">
                        <label htmlFor="password">New Password</label>
                        <input
                            className="form-input"
                            type="password"
                            id="password"
                            placeholder="Min 3, Max 20 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            // Disable if we don't have the target email
                            disabled={loading || !email} 
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="confirmpassword">Confirm New Password</label>
                        <input
                            className="form-input"
                            type="password"
                            id="confirmpassword"
                            placeholder="Re-enter new password"
                            value={confirmpassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            disabled={loading || !email}
                        />
                    </div>
                    
                    <button 
                        className="submit-button" 
                        type="submit" 
                        disabled={loading || !email}
                    >
                        {loading ? 'Processing...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
}