import React, { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import './Feedback.css';
import { useNavigate } from 'react-router-dom';

const Feedback = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        feedbackType: 'improvement',
        subject: '',
        message: '',
        rating: 0
    });
    const [status, setStatus] = useState('');
    const [error, setError] = useState('');
    const [hoveredStar, setHoveredStar] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleRatingClick = (rating) => {
        setFormData(prev => ({
            ...prev,
            rating: rating
        }));
    };

    const handleStarHover = (rating) => {
        setHoveredStar(rating);
    };

    const handleStarLeave = () => {
        setHoveredStar(0);
    };

    const handleClose = () => {
        navigate('/homepage');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setStatus('');

        if (!formData.name || !formData.email || !formData.feedbackType || !formData.subject || !formData.message) {
            setError('Please fill in all required fields.');
            return;
        }

        // Phone validation (if provided)
        if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
            setError('Please enter a valid 10-digit phone number.');
            return;
        }

        setIsLoading(true);

        try {
            const token = Cookies.get('jwttoken');
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/feedback/submit`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                setStatus('Thank you for your feedback!');
                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    feedbackType: 'suggestion',
                    subject: '',
                    message: '',
                    rating: 0
                });
                setHoveredStar(0);

                setTimeout(() => {
                    navigate('/homepage');
                    setStatus('');
                }, 3000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit feedback. Please try again.');
            setTimeout(() => {
                setError('');
            }, 5000);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="feedback-wrapper">
            <div className="feedback-container">
                <button 
                    className="close-button" 
                    onClick={handleClose}
                    aria-label="Close feedback form"
                    title="Close"
                >
                    ×
                </button>

                <div className="feedback-header" style={{ display: "block" }}>
                    <h1>Share Your Feedback</h1>
                    <p className="feedback-subtitle">We'd love to hear your thoughts and suggestions</p>
                </div>

                <div className="feedback-content">
                    <form onSubmit={handleSubmit} className="feedback-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="name">Full Name *</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">Email Address *</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    placeholder="john@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="phone">Phone Number</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    placeholder="+1 (555) 123-4567"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="feedbackType">Feedback Type *</label>
                                <select
                                    id="feedbackType"
                                    name="feedbackType"
                                    value={formData.feedbackType}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="feature">Feature Request</option>
                                    <option value="improvement">Improvement</option>
                                    <option value="bug">Bug Report</option>
                                    <option value="complaint">Complaint</option>
                                    <option value="appreciation">Appreciation</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group full-width">
                            <label htmlFor="subject">Subject *</label>
                            <input
                                type="text"
                                id="subject"
                                name="subject"
                                placeholder="What is your feedback about?"
                                value={formData.subject}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group full-width">
                            <label htmlFor="message">Your Message *</label>
                            <textarea
                                id="message"
                                name="message"
                                placeholder="Tell us your thoughts, ideas, or concerns in detail..."
                                value={formData.message}
                                onChange={handleChange}
                                required
                                rows="5"
                            />
                        </div>

                        <div className="form-group full-width">
                            <label>Rate Your Experience</label>
                            <div className="rating-input">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <span
                                        key={star}
                                        className={`star ${formData.rating >= star ? 'filled' : ''} ${hoveredStar >= star ? 'hovered' : ''}`}
                                        onClick={() => handleRatingClick(star)}
                                        onMouseEnter={() => handleStarHover(star)}
                                        onMouseLeave={handleStarLeave}
                                        title={`Rate ${star} star${star > 1 ? 's' : ''}`}
                                    >
                                        ★
                                    </span>
                                ))}
                                {formData.rating > 0 && <span className="rating-label">{formData.rating}/5</span>}
                            </div>
                            {status && <div className="success-message">{status}</div>}
                            {error && <div className="error-message">{error}</div>}
                        </div>

                        <button type="submit" className="submit-btn" disabled={isLoading}>
                            {isLoading ? 'Sending...' : 'Send Feedback'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Feedback;