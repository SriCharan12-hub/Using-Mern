import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import styles from './UserOrders.module.css';

const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  

  useEffect(() => {
    fetchAllOrders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [orders, statusFilter, searchTerm, dateFilter]);
  

  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      const token = Cookies.get('jwttoken');
      
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/all-orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setOrders(response.data.orders);
        setFilteredOrders(response.data.orders);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch orders');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };
 

  // Calculate statistics dynamically from filtered orders
  const calculateStatistics = () => {
    const stats = {
      totalOrders: filteredOrders.length,
      processingOrders: filteredOrders.filter(order => order.orderStatus?.toLowerCase() === 'processing').length,
      deliveredOrders: filteredOrders.filter(order => order.orderStatus?.toLowerCase() === 'delivered').length,
      cancelledOrders: filteredOrders.filter(order => order.orderStatus?.toLowerCase() === 'cancelled').length,
      shippedOrders: filteredOrders.filter(order => order.orderStatus?.toLowerCase() === 'shipped').length,
      totalRevenue: filteredOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0).toFixed(2)
    };
    return stats;
  };

  // Get dynamic statistics
  const statistics = calculateStatistics();

  const applyFilters = () => {
    let filtered = [...orders];

    // Status filter - match with orderStatus field
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => 
        order.orderStatus?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.userId?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt);
        switch(dateFilter) {
          case 'today':
            return orderDate.toDateString() === now.toDateString();
          case 'week':
            return orderDate >=  new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          case 'month':
            return orderDate.getMonth() === now.getMonth() && 
                   orderDate.getFullYear() === now.getFullYear();
          default:
            return true;
        }
      });
    }

    setFilteredOrders(filtered);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = Cookies.get('jwttoken');
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/admin/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        // Update local state
        setOrders(orders.map(order => 
          order._id === orderId ? { ...order, orderStatus: newStatus } : order
        ));
        alert('Order status updated successfully');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
      console.error('Error updating order status:', err);
    }
  };

  const viewOrderDetails = (order) => {
    console.log(order)
    setSelectedOrder(order);
    setShowModal(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      processing: '#3498db',
      shipped: '#9b59b6',
      delivered: '#27ae60',
      cancelled: '#e74c3c',
      pending: '#f39c12'
    };
    return colors[status?.toLowerCase()] || '#95a5a6';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
        return <div className="loader-container">
                <div className="loader"></div>
                <p>Loading...</p>
                </div>
    }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.ordersContainer}>
      <div className={styles.header}>
        <h2>User Orders Management</h2>
        
      </div>

      {/* Statistics Cards - Now Dynamic */}
      <div className={styles.statsGrid}>
              <div className={styles.statCard} style={{borderLeft: '4px solid #3498db'}}>
                <h3>📦 Total Orders</h3>
                <p className={styles.statNumber}>{statistics.totalOrders}</p>
                <small style={{color: '#666'}}>Filtered orders</small>
              </div>
      
              <div className={styles.statCard} style={{borderLeft: '4px solid #3498db'}}>
                <h3>🔄 Processing</h3>
                <p className={styles.statNumber} style={{color: '#3498db'}}>{statistics.processingOrders}</p>
                <small style={{color: '#666'}}>Currently processing</small>
              </div>
      
              <div className={styles.statCard} style={{borderLeft: '4px solid #27ae60'}}>
                <h3>✅ Delivered</h3>
                <p className={styles.statNumber} style={{color: '#27ae60'}}>{statistics.deliveredOrders}</p>
                <small style={{color: '#666'}}>Successfully delivered</small>
              </div>
      
              <div className={styles.statCard} style={{borderLeft: '4px solid #e74c3c'}}>
                <h3>❌ Cancelled</h3>
                <p className={styles.statNumber} style={{color: '#e74c3c'}}>{statistics.cancelledOrders}</p>
                <small style={{color: '#666'}}>Cancelled orders</small>
              </div>
      
              <div className={styles.statCard} style={{borderLeft: '4px solid #f39c12'}}>
                <h3>🚚 Shipped</h3>
                <p className={styles.statNumber} style={{color: '#f39c12'}}>{statistics.shippedOrders}</p>
                <small style={{color: '#666'}}>Successfully shipped</small>
              </div>
      
              <div className={styles.statCard} style={{borderLeft: '4px solid #9b59b6'}}>
                <h3>💰 Total Revenue</h3>
                <p className={styles.statNumber} style={{color: '#9b59b6'}}>₹{statistics.totalRevenue}</p>
                <small style={{color: '#666'}}>Average Value</small>
              </div>
            </div>

      {/* Filters */}
      <div className={styles.filtersContainer}>
        <div className={styles.filterGroup}>
          <label>Search:</label>
          <input
            type="text"
            placeholder="Order ID, Username, Email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterGroup}>
          <label>Status:</label>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Status</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label>Date:</label>
          <select 
            value={dateFilter} 
            onChange={(e) => setDateFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className={styles.tableContainer}>
        <table className={styles.ordersTable}>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Items</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="8" className={styles.noOrders}>No orders found</td>
              </tr>
            ) : (
              filteredOrders.map(order => (
                <tr key={order._id}>
                  <td className={styles.orderId}>
                    {order._id.substring(0, 8)}...
                  </td>
                  <td>
                    <div className={styles.customerInfo}>
                      <strong>{order.userId?.username || 'N/A'}</strong>
                      <small>{order.userId?.email || 'N/A'}</small>
                    </div>
                  </td>
                  <td>{formatDate(order.createdAt)}</td>
                  <td>{order.items?.length || 0} items</td>
                  <td className={styles.totalAmount}>
                    ₹{order.totalAmount?.toFixed(2) || '0.00'}
                  </td>
                  <td>
                    <span className={styles.paymentBadge}>
                      {order.paymentMethod?.toUpperCase() || 'N/A'}
                    </span>
                    <br />
                    <small style={{color: order.paymentStatus === 'Paid' ? '#27ae60' : '#f39c12'}}>
                      {order.paymentStatus}
                    </small>
                  </td>
                  <td>
                    <span 
                      className={styles.statusBadge}
                      style={{ backgroundColor: getStatusColor(order.orderStatus) }}
                    >
                      {order.orderStatus}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button 
                        onClick={() => viewOrderDetails(order)}
                        className={styles.viewBtn}
                      >
                        👁 View
                      </button>
                      <select
                        value={order.orderStatus}
                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                        className={styles.statusSelect}
                      >
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Order Details</h3>
              <button onClick={() => setShowModal(false)} className={styles.closeBtn}>×</button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.orderInfo}>
                <p><strong>Order ID:</strong> {selectedOrder._id}</p>
                <p><strong>Customer:</strong> {selectedOrder.userId?.username}</p>
                <p><strong>Email:</strong> {selectedOrder.userId?.email}</p>
                
                <p><strong>Date:</strong> {formatDate(selectedOrder.createdAt)}</p>
                <p><strong>Payment Method:</strong> {selectedOrder.paymentMethod?.toUpperCase()}</p>
                <p><strong>Payment Status:</strong> 
                  <span style={{
                    color: selectedOrder.paymentStatus === 'Paid' ? '#27ae60' : '#f39c12',
                    fontWeight: 'bold',
                    marginLeft: '5px'
                  }}>
                    {selectedOrder.paymentStatus}
                  </span>
                </p>
                <p>
                  <strong>Order Status:</strong> 
                  <span 
                    className={styles.statusBadge}
                    style={{ backgroundColor: getStatusColor(selectedOrder.orderStatus), marginLeft: '10px' }}
                  >
                    {selectedOrder.orderStatus}
                  </span>
                </p>
              </div>

            <div className={styles.shippingInfo}>
                <h4>Shipping Address</h4>
                <p><strong>Name:</strong> {selectedOrder.shippingDetails?.fullName || 'N/A'}</p>
                <p><strong>Address:</strong> {selectedOrder.shippingDetails?.Address || 'N/A'}</p>
                <p><strong>City:</strong> {selectedOrder.shippingDetails?.City || 'N/A'}</p>
                
                <p><strong>Zip Code:</strong> {selectedOrder.shippingDetails?.postalCode || 'N/A'}</p>
                <p><strong>PhoneNumber:</strong> {selectedOrder.shippingDetails?.PhoneNumber || 'N/A'}</p>
              </div>

              <div className={styles.itemsList}>
                <h4>Order Items</h4>
                {selectedOrder.items?.map((item, index) => (
                  <div key={index} className={styles.orderItem}>
                    <img 
                      src={item.productId?.image || '/placeholder.png'} 
                      alt={item.productId?.title || 'Product'}
                      className={styles.itemImage}
                    />
                    <div className={styles.itemDetails}>
                      <p><strong>{item.productId?.title || 'Product'}</strong></p>
                      <p>Quantity: {item.quantity}</p>
                      <p>Price at Order: ₹{item.priceAtOrder?.toFixed(2)}</p>
                    </div>
                    <div className={styles.itemTotal}>
                      ₹{(item.priceAtOrder * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.orderTotal}>
                <h4>Total Amount: ₹{selectedOrder.totalAmount?.toFixed(2)}</h4>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserOrders;