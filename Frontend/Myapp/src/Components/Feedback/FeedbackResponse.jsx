import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import './FeedbackResponse.css';

const FeedbackResponse = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [updateLoading, setUpdateLoading] = useState({});
    const [selectedFeedback, setSelectedFeedback] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL;

    const fetchStats = useCallback(async () => {
        try {
            const token = Cookies.get('jwttoken');
            if (!token) return;

            const response = await axios.get(`${API_URL}/feedback/stats`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (err) {
            console.error('Stats fetch error:', err);
        }
    }, [API_URL]);

    const fetchFeedbacks = useCallback(async () => {
        setLoading(true);
        setError('');
        
        try {
            const token = Cookies.get('jwttoken');
            
            if (!token) {
                setError('Authentication required. Please log in.');
                setLoading(false);
                return;
            }

            const params = {
                adminView: 'true'  // Added to fetch all feedbacks (admin view)
            };
            
            if (filter && filter !== 'all') {
                params.status = filter;
            }

            if (typeFilter && typeFilter !== 'all') {
                params.feedbackType = typeFilter;
            }

            if (sortBy === 'newest') {
                params.sortBy = 'createdAt';
                params.order = 'desc';
            } else if (sortBy === 'oldest') {
                params.sortBy = 'createdAt';
                params.order = 'asc';
            } else if (sortBy === 'rating') {
                params.sortBy = 'rating';
                params.order = 'desc';
            }

            const response = await axios.get(`${API_URL}/feedback`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                params: params
            });

            if (response.data.success) {
                setFeedbacks(response.data.data || []);
                setError('');
            } else {
                setError(response.data.message || 'Failed to fetch feedback');
            }
        } catch (err) {
            console.error('Fetch error:', err);
            const errorMessage = err.response?.data?.message 
                || err.message 
                || 'Failed to fetch feedback. Please try again.';
            setError(errorMessage);
            
            if (err.response?.status === 401 || err.response?.status === 403) {
                setFeedbacks([]);
            }
        } finally {
            setLoading(false);
        }
    }, [filter, typeFilter, sortBy, API_URL]);

    useEffect(() => {
        fetchStats();
        fetchFeedbacks();
    }, [fetchStats, fetchFeedbacks]);

    const updateFeedbackStatus = async (feedbackId, newStatus) => {
        setUpdateLoading(prev => ({ ...prev, [feedbackId]: true }));
        setError('');

        try {
            const token = Cookies.get('jwttoken');
            
            if (!token) {
                setError('Authentication required. Please log in.');
                return;
            }

            const response = await axios.put(
                `${API_URL}/feedback/${feedbackId}/status`,
                { status: newStatus },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                setFeedbacks(prevFeedbacks => 
                    prevFeedbacks.map(fb => 
                        fb._id === feedbackId 
                            ? { ...fb, status: newStatus }
                            : fb
                    )
                );
                await fetchStats();
            } else {
                setError(response.data.message || 'Failed to update feedback status');
            }
        } catch (err) {
            console.error('Update error:', err);
            const errorMessage = err.response?.data?.message 
                || err.message 
                || 'Failed to update feedback status';
            setError(errorMessage);
            await fetchFeedbacks();
        } finally {
            setUpdateLoading(prev => ({ ...prev, [feedbackId]: false }));
        }
    };

    const deleteFeedback = async (feedbackId) => {
        if (!window.confirm('Are you sure you want to delete this feedback?')) {
            return;
        }

        try {
            const token = Cookies.get('jwttoken');
            
            const response = await axios.delete(
                `${API_URL}/feedback/${feedbackId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                setFeedbacks(prevFeedbacks => 
                    prevFeedbacks.filter(fb => fb._id !== feedbackId)
                );
                setSelectedFeedback(null);
                await fetchStats();
            }
        } catch (err) {
            console.error('Delete error:', err);
            setError(err.response?.data?.message || 'Failed to delete feedback');
        }
    };

    const filteredFeedbacks = feedbacks.filter(feedback => {
        if (!searchTerm) return true;
        
        const searchLower = searchTerm.toLowerCase();
        return (
            feedback.subject?.toLowerCase().includes(searchLower) ||
            feedback.message?.toLowerCase().includes(searchLower) ||
            feedback.name?.toLowerCase().includes(searchLower) ||
            feedback.email?.toLowerCase().includes(searchLower)
        );
    });

    const getStatusCount = (status) => {
        return stats?.byStatus?.find(s => s._id === status)?.count || 0;
    };

    const getTypeCount = (type) => {
        return stats?.byType?.find(t => t._id === type)?.count || 0;
    };

    if (loading && !stats) {
        return (
            <div className="feedback-response-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading feedback...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="feedback-response-container">
            <div className="feedback-header-section">
                <h1>Feedback Management Dashboard</h1>
                
            </div>

            {error && (
                <div className="error-banner">
                    <span>⚠️ {error}</span>
                    <button onClick={() => setError('')} className="close-btn">×</button>
                </div>
            )}

            {/* Statistics Cards */}
            {stats && (
                <div className="stats-grid">
                    <div className="stat-card total">
                        <div className="stat-icon">📊</div>
                        <div className="stat-content">
                            <h3>Total Feedback</h3>
                            <p className="stat-number">{stats.total}</p>
                        </div>
                    </div>

                    <div className="stat-card pending">
                        <div className="stat-icon">⏳</div>
                        <div className="stat-content">
                            <h3>Pending</h3>
                            <p className="stat-number">{getStatusCount('pending')}</p>
                        </div>
                    </div>

                    <div className="stat-card reviewed">
                        <div className="stat-icon">👁️</div>
                        <div className="stat-content">
                            <h3>Reviewed</h3>
                            <p className="stat-number">{getStatusCount('reviewed')}</p>
                        </div>
                    </div>

                    <div className="stat-card resolved">
                        <div className="stat-icon">✓</div>
                        <div className="stat-content">
                            <h3>Resolved</h3>
                            <p className="stat-number">{getStatusCount('resolved')}</p>
                        </div>
                    </div>

                    <div className="stat-card rating">
                        <div className="stat-icon">⭐</div>
                        <div className="stat-content">
                            <h3>Avg Rating</h3>
                            <p className="stat-number">
                                {stats.averageRating?.avgRating 
                                    ? stats.averageRating.avgRating.toFixed(1) 
                                    : 'N/A'}
                            </p>
                            <small>{stats.averageRating?.totalRatings || 0} ratings</small>
                        </div>
                    </div>
                </div>
            )}

            {/* Type Breakdown */}
            {stats && stats.byType && stats.byType.length > 0 && (
                <div className="type-breakdown">
                    <h3>Feedback by Type</h3>
                    <div className="type-chips">
                        {stats.byType.map(type => (
                            <div key={type._id} className={`type-chip ${type._id}`}>
                                <span className="type-name">{type._id}</span>
                                <span className="type-count">{type.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Filters and Search */}
            <div className="controls-section">
                <div className="search-box">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Search by subject, message, name, or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="clear-search">×</button>
                    )}
                </div>
                
                <div className="filter-group">
                    <select 
                        value={filter} 
                        onChange={(e) => setFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="resolved">Resolved</option>
                    </select>

                    <select 
                        value={typeFilter} 
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">All Types</option>
                        <option value="bug">Bug</option>
                        <option value="feature">Feature</option>
                        <option value="improvement">Improvement</option>
                        <option value="complaint">Complaint</option>
                        <option value="appreciation">Appreciation</option>
                        <option value="other">Other</option>
                    </select>
                    
                    <select 
                        value={sortBy} 
                        onChange={(e) => setSortBy(e.target.value)}
                        className="filter-select"
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="rating">By Rating</option>
                    </select>
                </div>
            </div>

            {/* Feedback List */}
            <div className="feedback-content">
                <div className="results-header">
                    <h3>Showing {filteredFeedbacks.length} feedback{filteredFeedbacks.length !== 1 ? 's' : ''}</h3>
                </div>

                {loading ? (
                    <div className="loading-state">Loading feedback...</div>
                ) : filteredFeedbacks.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📭</div>
                        <h3>No feedback found</h3>
                        <p>{searchTerm ? 'Try adjusting your search or filters' : 'No feedback available'}</p>
                    </div>
                ) : (
                    <div className="feedback-grid">
                        {filteredFeedbacks.map(feedback => (
                            <div 
                                key={feedback._id} 
                                className={`feedback-item ${feedback.status} ${selectedFeedback?._id === feedback._id ? 'selected' : ''}`}
                                onClick={() => setSelectedFeedback(feedback)}
                            >
                                <div className="feedback-item-header">
                                    <div className="feedback-title">
                                        <h4>{feedback.subject}</h4>
                                        <span className={`badge-type ${feedback.feedbackType}`}>
                                            {feedback.feedbackType}
                                        </span>
                                    </div>
                                    <span className={`badge-status ${feedback.status}`}>
                                        {feedback.status}
                                    </span>
                                </div>

                                <div className="feedback-item-meta">
                                    <span>👤 {feedback.name}</span>
                                    <span>📅 {new Date(feedback.createdAt).toLocaleDateString()}</span>
                                    {feedback.rating && (
                                        <span>⭐ {feedback.rating}/5</span>
                                    )}
                                </div>

                                <p className="feedback-preview">
                                    {feedback.message.length > 100 
                                        ? feedback.message.substring(0, 100) + '...' 
                                        : feedback.message}
                                </p>

                                <div className="feedback-item-actions" onClick={(e) => e.stopPropagation()}>
                                    <select
                                        value={feedback.status}
                                        onChange={(e) => updateFeedbackStatus(feedback._id, e.target.value)}
                                        className="action-select"
                                        disabled={updateLoading[feedback._id]}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="reviewed">Reviewed</option>
                                        <option value="resolved">Resolved</option>
                                    </select>
                                    <button 
                                        onClick={() => deleteFeedback(feedback._id)}
                                        className="delete-btn"
                                        title="Delete feedback"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedFeedback && (
                <div className="modal-overlay" onClick={() => setSelectedFeedback(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{selectedFeedback.subject}</h2>
                            <button onClick={() => setSelectedFeedback(null)} className="modal-close">×</button>
                        </div>

                        <div className="modal-body">
                            <div className="detail-row">
                                <span className="label">Name:</span>
                                <span className="value">{selectedFeedback.name}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Email:</span>
                                <span className="value">{selectedFeedback.email}</span>
                            </div>
                            {selectedFeedback.phone && (
                                <div className="detail-row">
                                    <span className="label">Phone:</span>
                                    <span className="value">{selectedFeedback.phone}</span>
                                </div>
                            )}
                            <div className="detail-row">
                                <span className="label">Type:</span>
                                <span className={`badge-type ${selectedFeedback.feedbackType}`}>
                                    {selectedFeedback.feedbackType}
                                </span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Status:</span>
                                <span className={`badge-status ${selectedFeedback.status}`}>
                                    {selectedFeedback.status}
                                </span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Date:</span>
                                <span className="value">
                                    {new Date(selectedFeedback.createdAt).toLocaleString()}
                                </span>
                            </div>
                            {selectedFeedback.rating && (
                                <div className="detail-row">
                                    <span className="label">Rating:</span>
                                    <span className="value rating-stars">
                                        {'⭐'.repeat(selectedFeedback.rating)} ({selectedFeedback.rating}/5)
                                    </span>
                                </div>
                            )}
                            
                            <div className="detail-section">
                                <h4>Message</h4>
                                <p className="message-content">{selectedFeedback.message}</p>
                            </div>

                            {selectedFeedback.adminNotes && (
                                <div className="detail-section admin-section">
                                    <h4>Admin Notes</h4>
                                    <p>{selectedFeedback.adminNotes}</p>
                                </div>
                            )}
                        </div>

                        <div className="modal-footer">
                            <select
                                value={selectedFeedback.status}
                                onChange={(e) => updateFeedbackStatus(selectedFeedback._id, e.target.value)}
                                className="action-select"
                                disabled={updateLoading[selectedFeedback._id]}
                            >
                                <option value="pending">Pending</option>
                                <option value="reviewed">Reviewed</option>
                                <option value="resolved">Resolved</option>
                            </select>
                            <button 
                                onClick={() => deleteFeedback(selectedFeedback._id)}
                                className="delete-btn-large"
                            >
                                Delete Feedback
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FeedbackResponse;