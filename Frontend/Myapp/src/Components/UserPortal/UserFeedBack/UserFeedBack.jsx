import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import './UserFeedBack.css';

const UserFeedback = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        feedbackType: 'suggestion',
        subject: '',
        message: '',
        rating: 0
    });
    const [myFeedbacks, setMyFeedbacks] = useState([]);
    const [status, setStatus] = useState('');
    const [error, setError] = useState('');
    const [hoveredStar, setHoveredStar] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingFeedbacks, setIsFetchingFeedbacks] = useState(true);

    const token = Cookies.get('jwttoken');
    const headers = { Authorization: `Bearer ${token}` };

    // Fetch user's feedbacks on component mount
    useEffect(() => {
        fetchMyFeedbacks();
    }, []);

    const fetchMyFeedbacks = async () => {
        setIsFetchingFeedbacks(true);
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/feedback`,
                { headers }
            );
            
            if (response.data.success) {
                setMyFeedbacks(response.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch feedbacks:', err);
            setError('Failed to load your feedbacks');
            setTimeout(() => setError(''), 3000);
        } finally {
            setIsFetchingFeedbacks(false);
        }
    };

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setStatus('');

        if (!formData.name || !formData.email || !formData.feedbackType || !formData.subject || !formData.message) {
            setError('Please fill in all required fields.');
            setTimeout(() => setError(''), 3000);
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address.');
            setTimeout(() => setError(''), 3000);
            return;
        }

        setIsLoading(true);

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/feedback/submit`,
                formData,
                { headers }
            );

            if (response.data.success) {
                setStatus('Thank you for your feedback! We will review it soon.');
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

                // Refresh the feedbacks list
                await fetchMyFeedbacks();

                setTimeout(() => {
                    setStatus('');
                }, 3000);
            }
        } catch (err) {
            console.error('Error submitting feedback:', err);
            setError(err.response?.data?.message || 'Failed to submit feedback. Please try again.');
            setTimeout(() => {
                setError('');
            }, 5000);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'pending':
                return 'status-badge-pending';
            case 'reviewed':
                return 'status-badge-reviewed';
            case 'resolved':
                return 'status-badge-resolved';
            default:
                return 'status-badge-pending';
        }
    };

    const getStatusText = (status) => {
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    const getFeedbackTypeColor = (type) => {
        switch (type) {
            case 'bug':
                return '#dc3545';
            case 'suggestion':
                return '#667eea';
            case 'complaint':
                return '#ff6b6b';
            case 'praise':
                return '#51cf66';
            case 'other':
                return '#6c757d';
            default:
                return '#6c757d';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="user-feedback-container">
            <h1 className="feedback-main-title">Feedback Center</h1>
            
            {/* Feedback Form Section */}
            <div className="feedback-form-section">
                <div className="section-header">
                    <h2 className='feed-head'>Submit New Feedback</h2>
                    <p className='feed-para'>Share your thoughts, suggestions, or report issues</p>
                </div>

                <form onSubmit={handleSubmit} className="user-feedback-form">
                    <div className="form-row-user">
                        <div className="form-group-user">
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

                        <div className="form-group-user">
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

                    <div className="form-row-user">
                        <div className="form-group-user">
                            <label htmlFor="phone">Phone Number</label>
                            <input
                                type="number"
                                id="phone"
                                name="phone"
                                placeholder="+1 (555) 123-4567"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group-user">
                            <label htmlFor="feedbackType">Feedback Type *</label>
                            <select
                                id="feedbackType"
                                name="feedbackType"
                                value={formData.feedbackType}
                                onChange={handleChange}
                                required
                            >
                                <option value="suggestion">Suggestion</option>
                                <option value="complaint">Complaint</option>
                                <option value="praise">Praise</option>
                                <option value="bug">Bug Report</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group-user full-width-user">
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

                    <div className="form-group-user full-width-user">
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

                    <div className="form-group-user full-width-user">
                        <label>Rate Your Experience</label>
                        <div className="rating-input-user">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                    key={star}
                                    className={`star-user ${formData.rating >= star ? 'filled-user' : ''} ${hoveredStar >= star ? 'hovered-user' : ''}`}
                                    onClick={() => handleRatingClick(star)}
                                    onMouseEnter={() => handleStarHover(star)}
                                    onMouseLeave={handleStarLeave}
                                    title={`Rate ${star} star${star > 1 ? 's' : ''}`}
                                >
                                    ★
                                </span>
                            ))}
                            {formData.rating > 0 && <span className="rating-label-user">{formData.rating}/5</span>}
                        </div>
                    </div>

                    {status && <div className="success-message-user">{status}</div>}
                    {error && <div className="error-message-user">{error}</div>}

                    <button type="submit" className="submit-btn-user" disabled={isLoading}>
                        {isLoading ? 'Sending...' : 'Submit Feedback'}
                    </button>
                </form>
            </div>

            {/* My Feedbacks Section */}
            <div className="feedbacks-list-section">
                <div className="section-header">
                    <h2>Your Feedbacks</h2>
                    <p>Track the status of your submitted feedbacks</p>
                </div>

                {isFetchingFeedbacks ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>Loading your feedbacks...</p>
                    </div>
                ) : myFeedbacks.length === 0 ? (
                    <div className="no-feedback-message">
                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 10H8.01M12 10H12.01M16 10H16.01M9 16H5C3.89543 16 3 15.1046 3 14V6C3 4.89543 3.89543 4 5 4H19C20.1046 4 21 4.89543 21 6V14C21 15.1046 20.1046 16 19 16H14L9 21V16Z" stroke="#667eea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <h3>No feedbacks yet</h3>
                        <p>Submit your first feedback using the form above</p>
                    </div>
                ) : (
                    <div className="feedbacks-grid">
                        {myFeedbacks.map((feedback) => (
                            <div key={feedback._id} className="feedback-card">
                                <div className="feedback-card-header">
                                    <span 
                                        className="feedback-type-badge" 
                                        style={{ backgroundColor: getFeedbackTypeColor(feedback.feedbackType) }}
                                    >
                                        {feedback.feedbackType}
                                    </span>
                                    <span className={`status-badge ${getStatusBadgeClass(feedback.status)}`}>
                                        {getStatusText(feedback.status)}
                                    </span>
                                </div>

                                <h3 className="feedback-subject">{feedback.subject}</h3>
                                <p className="feedback-message">{feedback.message}</p>

                                {feedback.rating && feedback.rating > 0 && (
                                    <div className="feedback-rating">
                                        {[...Array(5)].map((_, index) => (
                                            <span 
                                                key={index}
                                                className={`star-display ${index < feedback.rating ? 'filled-display' : ''}`}
                                            >
                                                ★
                                            </span>
                                        ))}
                                        <span className="rating-value">({feedback.rating}/5)</span>
                                    </div>
                                )}

                                {feedback.adminNotes && feedback.adminNotes.trim() !== '' && (
                                    <div className="admin-response">
                                        <strong>Admin Response:</strong>
                                        <p>{feedback.adminNotes}</p>
                                    </div>
                                )}

                                <div className="feedback-meta">
                                    <span className="feedback-date">
                                        {formatDate(feedback.createdAt)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserFeedback;