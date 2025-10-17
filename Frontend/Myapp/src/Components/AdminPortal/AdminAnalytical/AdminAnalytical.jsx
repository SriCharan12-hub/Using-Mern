import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from './AdminAnalytical.module.css';

const AdminAnalytics = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
 
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const applyFiltersMemo = useCallback(() => {
    let filtered = [...orders];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => 
        order.orderStatus?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(order => 
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.userId?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt);
        switch(dateFilter) {
          case 'today':
            return orderDate.toDateString() === now.toDateString();
          case 'week':
            return orderDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          case 'month':
            return orderDate.getMonth() === now.getMonth() && 
                   orderDate.getFullYear() === now.getFullYear();
          default:
            return true;
        }
      });
    }

    setFilteredOrders(filtered);
  }, [orders, statusFilter, searchTerm, dateFilter]);

  useEffect(() => {
    applyFiltersMemo();
  }, [applyFiltersMemo]);

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
  
  // Analytics Data Processing Functions
  const getStatusDistribution = () => {
    const statusCount = filteredOrders.reduce((acc, order) => {
      const status = order.orderStatus || 'Unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(statusCount).map(([name, value]) => ({ name, value }));
  };

  const getRevenueByDate = () => {
    const revenueByDate = {};
    
    filteredOrders.forEach(order => {
      const date = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      revenueByDate[date] = (revenueByDate[date] || 0) + (order.totalAmount || 0);
    });

    return Object.entries(revenueByDate)
      .map(([date, revenue]) => ({ date, revenue: parseFloat(revenue.toFixed(2)) }))
      .slice(-10);
  };

  const getOrdersByDate = () => {
    const ordersByDate = {};
    
    filteredOrders.forEach(order => {
      const date = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      ordersByDate[date] = (ordersByDate[date] || 0) + 1;
    });

    return Object.entries(ordersByDate)
      .map(([date, count]) => ({ date, orders: count }))
      .slice(-10);
  };

  const getPaymentMethodDistribution = () => {
    const paymentCount = filteredOrders.reduce((acc, order) => {
      const method = order.paymentMethod || 'Unknown';
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(paymentCount).map(([name, value]) => ({ name: name.toUpperCase(), value }));
  };

  const getTopCustomers = () => {
    const customerOrders = {};
    
    filteredOrders.forEach(order => {
      const customerId = order.userId?._id;
      const customerName = order.userId?.username || 'Unknown';
      
      if (!customerOrders[customerId]) {
        customerOrders[customerId] = {
          name: customerName,
          orders: 0,
          revenue: 0
        };
      }
      
      customerOrders[customerId].orders += 1;
      customerOrders[customerId].revenue += order.totalAmount || 0;
    });

    return Object.values(customerOrders)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map(customer => ({
        name: customer.name,
        orders: customer.orders,
        revenue: parseFloat(customer.revenue.toFixed(2))
      }));
  };

  const getAverageOrderValue = () => {
    if (filteredOrders.length === 0) return 0;
    const total = filteredOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    return (total / filteredOrders.length).toFixed(2);
  };

 
  
  const COLORS = ['#3498db', '#27ae60', '#f39c12', '#e74c3c', '#9b59b6', '#1abc9c'];

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
        <p>Loading Analytics...</p>
      </div>
    );
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.ordersContainer}>
      <div className={styles.header}>
        <h2>📊 Orders Analytics Dashboard</h2>
        <p style={{fontSize: '14px', color: '#666', marginTop: '5px'}}>
          Comprehensive insights and data visualization
        </p>
      </div>

      {/* Enhanced Statistics Cards - Now Dynamic */}
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
          <small style={{color: '#666'}}>Avg: ₹{getAverageOrderValue()}</small>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filtersContainer}>
        <div className={styles.filterGroup}>
          <label>📋 Status:</label>
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
          <label>📅 Date:</label>
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

      {/* Charts Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {/* Revenue Trend Chart */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{marginBottom: '20px', color: '#333'}}>📈 Revenue Trend (Last 10 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={getRevenueByDate()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => `₹${value}`} />
              <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Trend Chart */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{marginBottom: '20px', color: '#333'}}>📊 Orders Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={getOrdersByDate()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="orders" stroke="#82ca9d" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution Pie Chart */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{marginBottom: '20px', color: '#333'}}>🎯 Order Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={getStatusDistribution()}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {getStatusDistribution().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Methods Bar Chart */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{marginBottom: '20px', color: '#333'}}>💳 Payment Methods</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getPaymentMethodDistribution()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8">
                {getPaymentMethodDistribution().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Customers Chart */}
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '30px'
      }}>
        <h3 style={{marginBottom: '20px', color: '#333'}}>👥 Top 5 Customers by Revenue</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={getTopCustomers()} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={100} />
            <Tooltip />
            <Legend />
            <Bar dataKey="revenue" fill="#3498db" name="Revenue (₹)" />
            <Bar dataKey="orders" fill="#27ae60" name="Orders" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Orders Table */}
    
    </div>
  );
};

export default AdminAnalytics;