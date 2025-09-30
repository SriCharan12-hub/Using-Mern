import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import './Address.css';
import NavSearch from '../../AdminPortal/NavSearch/NavSearch';

const Address = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // States for the Add/Edit form
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [currentEditId, setCurrentEditId] = useState(null); 
  const [formDetails, setFormDetails] = useState({
    fullName: '',
    Address: '', 
    City: '', 
    postalCode: '',
    PhoneNumber: '',
  });

  const token = Cookies.get('jwttoken');
  const headers = { Authorization: `Bearer ${token}` };

  // --- Data Fetching and Handlers ---

  const fetchAddresses = async () => {
    if (!token) {
        setLoading(false);
        setError("Please log in to view your saved addresses.");
        return;
    }
    try {
      const res = await axios.get('http://localhost:8000/getaddress', { headers });
      setAddresses(res.data.addresses || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch addresses:', err);
      setError("Failed to load addresses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleEdit = (address) => {
    setCurrentEditId(address._id);
    setFormDetails({
      fullName: address.fullName,
      Address: address.Address,
      City: address.City,
      postalCode: address.postalCode,
      PhoneNumber: address.PhoneNumber,
    });
    setIsFormVisible(true);
  };

  const handleDelete = async (addressId) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    try {
      const res = await axios.delete(`http://localhost:8000/deleteaddress/${addressId}`, { headers });
      alert(res.data.message);
      fetchAddresses(); // Refresh the list
    } catch (err) {
      console.error('Address deletion failed:', err.response?.data || err);
      alert('Failed to delete address.');
    }
  };

  const handleAddNew = () => {
    setCurrentEditId(null);
    setFormDetails({ fullName: '', Address: '', City: '', postalCode: '', PhoneNumber: '' });
    setIsFormVisible(true);
  };
  
  const handleFormChange = (e) => {
      setFormDetails({ ...formDetails, [e.target.name]: e.target.value });
  };
  
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const url = currentEditId
        ? `http://localhost:8000/updateaddress/${currentEditId}`
        : 'http://localhost:8000/addaddress';
    const method = currentEditId ? 'put' : 'post';

    try {
        const res = await axios[method](url, formDetails, { headers });
        alert(res.data.message);
        setIsFormVisible(false);
        fetchAddresses(); // Refresh list
    } catch (err) {
        alert(`Failed to save address: ${err.response?.data?.message || "Check your input."}`);
    }
  };


  if (loading) {
    return <div className="address-status-message">Loading addresses...</div>;
  }

  if (error) {
    return <div className="address-status-message error">{error}</div>;
  }

  return (
    <div className="profile-page-wrapper">
      <NavSearch/>
      <div className="address-manager-container">
        
        {/* Header (Top Left Title, Top Right Button) */}
        <div className="address-manager__header" style={{marginTop:"50px"}}>
          <h1 className="address-manager__title">Saved Addresses</h1>
         
        </div>

        {/* Address Form (Modal/In-page component) */}
        {isFormVisible && (
            <div className="address-form-overlay">
              <div className="address-form-modal">
                <form onSubmit={handleFormSubmit} className="address-form">
                    <h3 className="form-heading">{currentEditId ? 'Edit Address' : 'Add New Address'}</h3>
                    <input type="text" name="fullName" placeholder="Full Name" value={formDetails.fullName} onChange={handleFormChange} required />
                    <input type="text" name="Address" placeholder="Address Line" value={formDetails.Address} onChange={handleFormChange} required />
                    <div className="input-row split-input">
                        <input type="text" name="City" placeholder="City" value={formDetails.City} onChange={handleFormChange} required />
                        <input type="text" name="postalCode" placeholder="Postal Code" value={formDetails.postalCode} onChange={handleFormChange} maxLength="6" required />
                    </div>
                    <input type="tel" name="PhoneNumber" placeholder="Phone Number" value={formDetails.PhoneNumber} onChange={handleFormChange} maxLength="10" required />
                    <div className="address-form-actions">
                        <button type="submit" className="btn-primary-action">{currentEditId ? 'Save Changes' : 'Add Address'}</button>
                        <button type="button" className="btn-secondary-action" onClick={() => setIsFormVisible(false)}>Cancel</button>
                    </div>
                </form>
              </div>
            </div>
        )}

        {/* Addresses List (Grid) */}
        <div className="addresses-list-grid">
          {/* Map through existing addresses */}
          {addresses.map((address) => (
            <div key={address._id} className="address-card">
              <div className="card-header">
                {/* Simplified Title - Use FullName as the title/label */}
                <h4 className="card-title">{address.fullName}</h4>
              </div>

              <div className="card-body">
                <p className="card-detail-person">{address.fullName}</p>
                <p className="card-detail-line">{address.Address}</p>
                <p className="card-detail-line">{address.City} - {address.postalCode}</p>
                <p className="card-detail-line">{address.PhoneNumber}</p>
              </div>
              
              {/* Card Footer with Actions */}
              <div className="card-footer-actions">
                <button className="action-btn-edit" onClick={() => handleEdit(address)}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M21.731 2.269a2.66 2.66 0 0 0-3.766 0L2.353 17.881a2.66 2.66 0 0 0 0 3.766l1.042 1.041a2.66 2.66 0 0 0 3.766 0L22.774 7.075a2.66 2.66 0 0 0 0-3.766l-1.043-1.04zM16.5 6.007l1.041 1.041L7.541 17.5l-1.04-1.04z" /></svg>
                  Edit
                </button>
                <button className="action-btn-delete" onClick={() => handleDelete(address._id)}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19.5 4.5h-15a1.5 1.5 0 0 0-1.5 1.5v15a1.5 1.5 0 0 0 1.5 1.5h15a1.5 1.5 0 0 0 1.5-1.5v-15a1.5 1.5 0 0 0-1.5-1.5zM9 18v-9m6 9v-9" /></svg>
                  Delete
                </button>
              </div>
            </div>
          ))}

          {/* Dedicated "Add New Address" Card */}
          <div className="add-new-card" onClick={handleAddNew}>
            <svg className="add-icon-large" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5v15m7.5-7.5h-15" /></svg>
            <p>Add New Address</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Address;