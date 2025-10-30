import React, { useState } from "react";
import axios from "axios";
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom'; 
import { Eye, EyeOff } from 'lucide-react';
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
    
    // Show password states
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
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
             <button onClick={()=>navigate('/verify')} className="Verify-back">Back</button>
            <div className="reset-password-card">
                <h2 className="reset-password-header">Reset Password</h2>
                
                
                
                <form onSubmit={handleSubmit} className="reset-password-form">
                    <p className="reset-password-subtext">
                        Setting new password for: 
                        <br/>
                        <strong>{email || "N/A (Please check your browser for cookies)"}</strong>
                    </p>

                    <div className="form-group">
                        <label htmlFor="password">New Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                className="form-input"
                                type={showPassword ? "text" : "password"}
                                id="password"
                                placeholder="Min 3, Max 20 characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                // Disable if we don't have the target email
                                disabled={loading || !email}
                                style={{ paddingRight: '40px' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '10px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#666'
                                }}
                                disabled={loading || !email}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="confirmpassword">Confirm New Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                className="form-input"
                                type={showConfirmPassword ? "text" : "password"}
                                id="confirmpassword"
                                placeholder="Re-enter new password"
                                value={confirmpassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                disabled={loading || !email}
                                style={{ paddingRight: '40px' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '10px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#666'
                                }}
                                disabled={loading || !email}
                            >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>
                    {message && (
                    <p className={`message ${isError ? 'error' : 'success'}`}>
                        {message}
                    </p>
                )}
                    
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