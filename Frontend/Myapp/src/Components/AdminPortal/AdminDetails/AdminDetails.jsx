import React, { useState, useEffect } from 'react';
import './AdminDetails.css';
import Cookies from "js-cookie";
import axios from "axios";
// import { useNavigate } from 'react-router-dom';

const AdminDetails = () => {
    // const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState(""); // This should be a masked value from the start

    const [confirmPassword, setConfirmPassword] = useState("");
    const [formPassword, setFormPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showPassword1, setShowPassword1] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await axios.get("http://localhost:8000/user/get", {
                    headers: {
                        Authorization: `Bearer ${Cookies.get("jwttoken")}`,
                    },
                });
                setUsername(res.data.result.username);
                setEmail(res.data.result.email);
                setPassword('••••••••');
            } catch (err) {
                console.error("Error fetching user:", err);
            }
        };
        fetchDetails();
    }, []);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");
        
        if (!formPassword || !confirmPassword) {
            setError("All fields are required.");
            return;
        }

        if (formPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            await axios.put(
                "http://localhost:8000/user/update",
                {
                    password: formPassword,
                    confirmPassword: confirmPassword,
                },
                {
                    headers: {
                        Authorization: `Bearer ${Cookies.get("jwttoken")}`,
                    },
                }
            );
            setFormPassword("");
            setConfirmPassword("");
            setSuccessMessage("Password updated successfully!");
        } catch (err) {
            console.error("Update failed:", err);
            if (err.response && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError("An unexpected error occurred. Please try again.");
            }
        }
    };

    return (
        <div className="user-details-page" style={{marginLeft:"50px",marginBottom:"90px"}}>
            <div className="details-container">
                {/* My Profile Section */}
                <div className="profile-card">
                    <h2 className="card-title">My Profile</h2>
                    <div className="profile-info-grid">
                        <div className="info-group">
                            <span className="info-label">Username</span>
                            <span className="info-value">{username}</span>
                        </div>
                        <div className="info-group">
                            <span className="info-label">Email</span>
                            <span className="info-value">{email}</span>
                        </div>
                        <div className="info-group">
                            <span className="info-label">Password</span>
                            <span className="info-value">{password}</span>
                        </div>
                    </div>
                </div>

                {/* Update Password Section */}
                <div className="update-password-card">
                    <h2 className="card-title">Update Password</h2>
                    <form onSubmit={handleUpdate} className="update-form">
                        <div className="form-group">
                            <label className="input-label" htmlFor="new-password">New Password</label>
                            <div className="input-field-wrapper">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="new-password"
                                    value={formPassword}
                                    onChange={(e) => setFormPassword(e.target.value)}
                                    className="input-field"
                                    placeholder="Enter new password"
                                />
                                <span className="toggle-visibility" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? '👁️' : '🔒'}
                                </span>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="input-label" htmlFor="confirm-password">Confirm Password</label>
                            <div className="input-field-wrapper">
                                <input
                                    type={showPassword1 ? "text" : "password"}
                                    id="confirm-password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="input-field"
                                    placeholder="Confirm new password"
                                />
                                <span className="toggle-visibility" onClick={() => setShowPassword1(!showPassword1)}>
                                    {showPassword1 ? '👁️' : '🔒'}
                                </span>
                            </div>
                        </div>

                        {error && <p className="message1 error-message1">{error}</p>}
                        {successMessage && <p className="message1 success-message1">{successMessage}</p>}
                        <button type="submit" className="update-btn">Update Password</button>
                        
                    </form>
                    
                </div>
                
                
            </div>
            
        </div>
    );
};

export default AdminDetails;