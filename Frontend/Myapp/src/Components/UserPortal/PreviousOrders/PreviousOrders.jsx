import React, { useState, useEffect } from 'react';
import styles from './PreviousOrders.module.css';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

const PreviousOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = Cookies.get('jwttoken');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/my-orders`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setOrders(data.orders);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      const token = Cookies.get('jwttoken');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/${orderId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        alert('Order cancelled successfully');
        fetchOrders(); // Refresh orders
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Failed to cancel order');
      console.error(err);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Processing':
        return styles.statusProcessing;
      case 'Shipped':
        return styles.statusShipped;
      case 'Delivered':
        return styles.statusDelivered;
      case 'Cancelled':
        return styles.statusCancelled;
      default:
        return '';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const toggleOrderDetails = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading your orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <h2>No Orders Yet</h2>
          <p>You haven't placed any orders yet.</p>
          <button 
            className={styles.shopButton}
            onClick={() => navigate('/homepage')}
          >
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>My Orders</h1>
      
      <div className={styles.ordersList}>
        {/* <button className='back-btn' onClick={()=>navigate('/userdashboard/userdetails')}>Back</button> */}
        {orders.map((order) => (
          <div key={order._id} className={styles.orderCard}>
            <div className={styles.orderHeader}>
              <div className={styles.orderInfo}>
                <div className={styles.orderId}>
                  Order ID: #{order._id.slice(-8).toUpperCase()}
                </div>
                <div className={styles.orderDate}>
                  {formatDate(order.createdAt)}
                </div>
              </div>
              
              <div className={styles.orderStatus}>
                <span className={`${styles.statusBadge} ${getStatusClass(order.orderStatus)}`}>
                  {order.orderStatus}
                </span>
                <span className={styles.paymentStatus}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>

            <div className={styles.orderSummary}>
              <div className={styles.itemCount}>
                {order.items.length} item{order.items.length > 1 ? 's' : ''}
              </div>
              <div className={styles.totalAmount}>
                Total: ₹{order.totalAmount.toFixed(2)}
              </div>
            </div>

            <div className={styles.orderActions}>
              <button 
                className={styles.detailsButton}
                onClick={() => toggleOrderDetails(order._id)}
              >
                {expandedOrder === order._id ? 'Hide Details' : 'View Details'}
              </button>
              
              {order.orderStatus === 'Processing' && (
                <button 
                  className={styles.cancelButton}
                  onClick={() => handleCancelOrder(order._id)}
                >
                  Cancel Order
                </button>
              )}
            </div>

            {expandedOrder === order._id && (
              <div className={styles.orderDetails}>
                <div className={styles.itemsList}>
                  <h3>Items:</h3>
                  {order.items.map((item, index) => (
                    <div key={index} className={styles.orderItem}>
                      {item.productId?.image && (
                        <img 
                          src={item.productId.image} 
                          alt={item.productId.title}
                          className={styles.productImage}
                        />
                      )}
                      <div className={styles.productInfo}>
                        <div className={styles.productName}>
                          {item.productId?.title || 'Product Unavailable'}
                        </div>
                        <div className={styles.productDetails}>
                          Quantity: {item.quantity} × ₹{item.priceAtOrder.toFixed(2)}
                        </div>
                      </div>
                      <div className={styles.itemTotal}>
                        ₹{(item.quantity * item.priceAtOrder).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className={styles.shippingInfo}>
                  <h3>Shipping Details:</h3>
                  <p>{order.shippingDetails.fullName}</p>
                  <p>{order.shippingDetails.Address}</p>
                  <p>{order.shippingDetails.City}, {order.shippingDetails.postalCode}</p>
                  <p>Phone: {order.shippingDetails.PhoneNumber}</p>
                </div>

                <div className={styles.paymentInfo}>
                  <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
                  <p><strong>Payment Status:</strong> {order.paymentStatus}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PreviousOrders;