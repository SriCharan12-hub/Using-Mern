import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Wishlist.css';
import axios from 'axios';
import Cookies from 'js-cookie';

const Wishlist = ({ onClose }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchWishlistData = async () => {
    const token = Cookies.get('jwttoken');
    if (!token) {
      setLoading(false);
      setError('Please log in to view your wishlist.');
      return;
    }

    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/wishlist/get`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlistItems(response.data.wishlist || []);
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      setError('Failed to fetch wishlist. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlistData();
  }, []);

  const handleRemoveFromWishlist = async (productId) => {
    const token = Cookies.get('jwttoken');
    if (!token) return;

    // Optimistic update
    setWishlistItems(prevItems =>
      prevItems.filter(item => String(item.product._id) !== String(productId))
    );

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/wishlist/remove`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { productId }
      });
    } catch (err) {
      console.error('Failed to remove from wishlist (server)', err);
      fetchWishlistData(); // revert if server fails
      alert('Failed to remove item. Please try again.');
    }
  };

  const handleClose = () => {
    // If parent passed an onClose, call it
    if (onClose) {
      onClose();
    } else {
      // Otherwise navigate to dashboard
      navigate('/userdashboard');
    }
  };

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="wishlist-overlay">
      <div className="wishlist-container">
        <button className="close-btn" onClick={handleClose}>
          &times;
        </button>
        <h1 className="main-title">My Wishlist</h1>
        {wishlistItems.length > 0 ? (
          <div className="wishlist-items-list">
            {wishlistItems.map(item => {
              const originalPrice = item.product.originalPrice || item.product.price;
              const discountedPrice = item.product.price;
              const discount = originalPrice - discountedPrice;
              const discountPercentage =
                originalPrice > 0
                  ? Math.round((discount / originalPrice) * 100)
                  : 0;

              return (
                <div className="wishlist-item-row" key={item.product._id}>
                  <div className="wishlist-item-image-col">
                    <img
                      src={item.product.image}
                      alt={item.product.title}
                      className="product-image"
                    />
                  </div>
                  <div className="wishlist-item-details-col">
                    <span className="product-title">{item.product.title}</span>
                    <div className="assurance-badge">
                      {item.product.isAssured && (
                        <span className="assured-text">🛡️Assured</span>
                      )}
                    </div>
                    <div className="price-info">
                      <span className="discounted-price">
                        ₹{discountedPrice.toFixed(2)}
                      </span>
                      {originalPrice > discountedPrice && (
                        <>
                          <span className="original-price">
                            ₹{originalPrice.toFixed(2)}
                          </span>
                          <span className="discount-percentage">
                            {discountPercentage}% off
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="wishlist-item-actions-col">
                    <button
                      className="remove-icon-btn"
                      onClick={() => handleRemoveFromWishlist(item.product._id)}
                      title="Remove from Wishlist"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-wishlist-message">Your wishlist is empty.</div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
