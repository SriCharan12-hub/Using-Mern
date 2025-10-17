import React, { useState, useEffect } from 'react';
import './Checkout.css';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import NavSearch from '../../AdminPortal/NavSearch/NavSearch';
import { useDispatch } from 'react-redux';
import { clearCart } from '../../../Slice';

const Checkout = () => {
    const navigate = useNavigate();
    const [userAddresses, setUserAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newAddressDetails, setNewAddressDetails] = useState({
        fullName: '',
        Address: '',
        City: '',
        postalCode: '',
        PhoneNumber: '',
    });
    const [currentEditId, setCurrentEditId] = useState(null);

    const [paymentMethod, setPaymentMethod] = useState('creditCard');
    const [cardDetails, setCardDetails] = useState({ cardNumber: '', expiryDate: '', cvv: '' });
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
    const shipping = 5.0;
    const taxes = subtotal * 0.10;
    const total = subtotal + shipping + taxes;

    const token = Cookies.get('jwttoken');
    const headers = { Authorization: `Bearer ${token}` };
    const dispatch = useDispatch();

    const fetchAddresses = async () => {
        if (!token) return;
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/getaddress`, { headers });
            const addresses = res.data.addresses || [];
            setUserAddresses(addresses);
            
            if (addresses.length > 0 && !selectedAddressId) {
                setSelectedAddressId(addresses[0]._id);
            }
            else if (addresses.length > 0 && selectedAddressId) {
                const stillExists = addresses.find(addr => addr._id === selectedAddressId);
                if (!stillExists) {
                    setSelectedAddressId(addresses[0]._id);
                }
            }
            else if (addresses.length === 0) {
                setSelectedAddressId(null);
            }
        } catch (err) {
            console.error('Failed to fetch addresses:', err);
        }
    };

    const handleSubmitAddress = async (e) => {
        e.preventDefault();
        if (!token) { alert("Please log in."); return; }

        const url = currentEditId
            ? `${import.meta.env.VITE_API_URL}/updateaddress/${currentEditId}`
            : `${import.meta.env.VITE_API_URL}/addaddress`;
        const method = currentEditId ? 'put' : 'post';
        
        try {
            const res = await axios[method](url, newAddressDetails, { headers });
            alert(res.data.message);
            
            setNewAddressDetails({ fullName: '', Address: '', City: '', postalCode: '', PhoneNumber: '' });
            setIsAddingNew(false);
            setCurrentEditId(null);
            
            await fetchAddresses();
        } catch (err) {
            console.error('Address submission failed:', err.response?.data || err);
            alert(`Failed to save address: ${err.response?.data?.message || "Check your input."}`);
        }
    };

    const handleDeleteAddress = async (id) => {
        if (!window.confirm("Are you sure you want to delete this address?")) return;
        if (!token) { alert("Please log in."); return; }

        try {
            const res = await axios.delete(`${import.meta.env.VITE_API_URL}/deleteaddress/${id}`, { headers });
            
            setUserAddresses(prevAddresses => {
                const updatedAddresses = prevAddresses.filter(addr => addr._id !== id);
                
                if (selectedAddressId === id) {
                    setSelectedAddressId(updatedAddresses.length > 0 ? updatedAddresses[0]._id : null);
                }
                
                return updatedAddresses;
            });
            
            alert(res.data.message);
            
            await fetchAddresses();
        } catch (err) {
            console.error('Address deletion failed:', err.response?.data || err);
            alert(`Failed to delete address: ${err.response?.data?.message || "Unknown error"}`);
            await fetchAddresses();
        }
    };
    
    const handleEditAddress = (address) => {
        setCurrentEditId(address._id);
        setNewAddressDetails({
            fullName: address.fullName,
            Address: address.Address,
            City: address.City,
            postalCode: address.postalCode,
            PhoneNumber: address.PhoneNumber,
        });
        setIsAddingNew(true);
    };

    useEffect(() => {
        if (!token) {
            setLoading(false);
            setError('Please log in to view your cart.');
            return;
        }

        const fetchCartAndAddresses = async () => {
            await fetchAddresses();
            
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/cart`, { headers });
                const data = res.data;
                let items = data.cart || data[0]?.items || data.items || [];
                
                const validItems = items.filter(item => {
                    const product = item.productId || item.product;
                    return product && product._id && product.title && product.price;
                });
                
                const normalized = validItems.map(item => {
                    const product = item.productId || item.product;
                    return {
                        id: product._id,
                        name: product.title || product.name || 'Unknown Product',
                        image: product.image,
                        price: product.price || 0,
                        quantity: item.quantity || 1,
                    };
                });
                
                setCartItems(normalized);
                setLoading(false);
            } catch (err) {
                setLoading(false);
                setError('Failed to fetch cart. Please try again.');
                console.error('Failed to fetch cart for checkout', err);
            }
        };
        fetchCartAndAddresses();
    }, [token]);

    const handleAddressFormChange = (e) => {
        const { name, value } = e.target;
        setNewAddressDetails(prev => ({ ...prev, [name]: value }));
    };

    const handleCardInputChange = (e) => {
        const { name, value } = e.target;
        setCardDetails({ ...cardDetails, [name]: value });
    };

    // --- UPDATED LOGIC HERE ---
    const handlePlaceOrder = async () => {
        if (!token) {
            alert("You must be logged in to place an order.");
            return;
        }
        if (!selectedAddressId) {
            alert("Please select a shipping address.");
            return;
        }

        const finalShippingDetails = userAddresses.find(addr => addr._id === selectedAddressId);
        if (!finalShippingDetails) {
            alert("Error: Selected address details missing.");
            return;
        }

        try {
            const orderPayload = {
                shippingDetails: finalShippingDetails, 
                paymentMethod,
                items: cartItems.map(item => ({
                    productId: item.id,
                    quantity: item.quantity
                })),
                totalAmount: total
            };

            const response = await axios.post(`${import.meta.env.VITE_API_URL}/place`, orderPayload, { headers });

            if (response.status === 201) {
                const newOrder = response.data.order; 
                
                // Construct detailed item list for OrderConfirmed page display
                const itemsForConfirmation = cartItems.map(item => ({
                    productId: item.id,
                    title: item.name, 
                    image: item.image,
                    quantity: item.quantity,
                    priceAtOrder: item.price // Use 'priceAtOrder' as the OrderConfirmed component expects
                }));

                navigate('/orderconfirmed', { 
                    state: { 
                        order: {
                            ...newOrder, 
                            items: itemsForConfirmation, // Pass the detailed item array
                            totalAmount: total           // Ensure total is passed accurately
                        }
                    } 
                });
                // Clear local cart immediately so navbar updates
                try {
                    dispatch(clearCart());
                } catch (e) { console.debug('clearCart dispatch failed', e); }
                try { localStorage.removeItem('cartState'); localStorage.removeItem('cart'); } catch (e) { console.debug('failed clearing localStorage after order', e); }
                window.scrollTo(0, 0);
            }
        } catch (err) {
            console.error('Failed to place order:', err.response?.data || err.message);
            alert('Failed to place order. Please try again.');
        }
    };
    // --- END UPDATED LOGIC ---

    if (loading) {
        return <div className="loader-container">
            <div className="loader"></div>
            <p>Loading...</p>
        </div>
    }

    if (error) {
        return <div className="checkout-error">{error}</div>;
    }

    if (cartItems.length === 0) {
        return (
            <div className="checkout-page">
                <NavSearch/>
                <div className="empty-cart-message">Your cart is empty.</div>
            </div>
        );
    }

    const addressBlockContent = isAddingNew || userAddresses.length === 0 ? (
        <form onSubmit={handleSubmitAddress} className="address-form">
            <h3 className="form-heading">{currentEditId ? 'Edit Address' : 'Add New Address'}</h3>
            <input 
                type="text" 
                name="fullName" 
                placeholder="Full Name" 
                value={newAddressDetails.fullName} 
                onChange={handleAddressFormChange} 
                required 
            />
            <input 
                type="text" 
                name="Address" 
                placeholder="Address Line" 
                value={newAddressDetails.Address} 
                onChange={handleAddressFormChange} 
                required 
            />
            <div className="input-row split-input">
                <input 
                    type="text" 
                    name="City" 
                    placeholder="City" 
                    value={newAddressDetails.City} 
                    onChange={handleAddressFormChange} 
                    required 
                />
                <input 
                    type="number" 
                    name="postalCode" 
                    placeholder="Postal Code" 
                    value={newAddressDetails.postalCode} 
                    onChange={handleAddressFormChange} 
                    pattern="[0-9]{6}"
                    maxLength="6"
                    title="Please enter a valid 6-digit postal code"
                    required 
                />
            </div>
            <input 
                type="number" 
                name="PhoneNumber" 
                placeholder="Phone Number" 
                value={newAddressDetails.PhoneNumber} 
                onChange={handleAddressFormChange} 
                pattern="[0-9]{10}"
                maxLength="10"
                title="Please enter a valid 10-digit phone number"
                required 
            />
            <div className="address-form-actions">
                <button type="submit" className="btn-primary">
                    {currentEditId ? 'Save Changes' : 'Add Address'}
                </button>
                <button 
                    type="button" 
                    className="btn-secondary" 
                    onClick={() => { 
                        setIsAddingNew(false); 
                        setCurrentEditId(null); 
                        setNewAddressDetails({ fullName: '', Address: '', City: '', postalCode: '', PhoneNumber: '' }); 
                    }}
                >
                    Cancel
                </button>
            </div>
        </form>
    ) : (
        <div className="address-selection-group">
            <h3 className="form-heading">Shipping Address</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {userAddresses.map(address => (
                    <div 
                        key={address._id} 
                        onClick={() => setSelectedAddressId(address._id)}
                        style={{
                            border: selectedAddressId === address._id ? '2px solid #8b5cf6' : '1px solid #e5e7eb',
                            borderRadius: '8px',
                            padding: '16px',
                            cursor: 'pointer',
                            backgroundColor: selectedAddressId === address._id ? '#f5f3ff' : '#fff',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            position: 'relative'
                        }}
                    >
                        <div style={{ flex: 1, display: 'flex', gap: '12px' }}>
                            <div style={{ 
                                marginTop: '2px',
                                flexShrink: 0
                            }}>
                                <div style={{
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '50%',
                                    border: selectedAddressId === address._id ? '6px solid #8b5cf6' : '2px solid #d1d5db',
                                    backgroundColor: '#fff',
                                    transition: 'all 0.2s ease'
                                }} />
                            </div>
                            
                            <div style={{ flex: 1 }}>
                                <p style={{ 
                                    fontWeight: '600', 
                                    fontSize: '16px', 
                                    marginBottom: '4px',
                                    color: '#111827'
                                }}>
                                    {address.fullName}
                                </p>
                                <p style={{ 
                                    fontSize: '14px', 
                                    color: '#6b7280',
                                    marginBottom: '2px'
                                }}>
                                    {address.PhoneNumber}
                                </p>
                                <p style={{ 
                                    fontSize: '14px', 
                                    color: '#4b5563',
                                    marginBottom: '2px',
                                    lineHeight: '1.5'
                                }}>
                                    {address.Address}
                                </p>
                                <p style={{ 
                                    fontSize: '14px', 
                                    color: '#4b5563'
                                }}>
                                    {address.City} - {address.postalCode}
                                </p>
                            </div>
                        </div>
                        
                        <div style={{ 
                            display: 'flex', 
                            gap: '8px',
                            marginLeft: '16px'
                        }}>
                            <button 
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    handleEditAddress(address); 
                                }}
                                style={{
                                    padding: '6px 12px',
                                    fontSize: '13px',
                                    fontWeight: '500',
                                    color: '#8b5cf6',
                                    backgroundColor: '#fff',
                                    border: '1px solid #8b5cf6',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    whiteSpace: 'nowrap'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = '#f5f3ff';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = '#fff';
                                }}
                            >
                                Edit
                            </button>
                            <button 
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    handleDeleteAddress(address._id); 
                                }}
                                style={{
                                    padding: '6px 12px',
                                    fontSize: '13px',
                                    fontWeight: '500',
                                    color: '#ef4444',
                                    backgroundColor: '#fff',
                                    border: '1px solid #ef4444',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    whiteSpace: 'nowrap'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = '#fef2f2';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = '#fff';
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            
            <button 
                onClick={() => { 
                    setIsAddingNew(true); 
                    setCurrentEditId(null); 
                    setNewAddressDetails({ fullName: '', Address: '', City: '', postalCode: '', PhoneNumber: '' }); 
                }}
                style={{
                    marginTop: '16px',
                    width: '100%',
                    padding: '12px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#8b5cf6',
                    backgroundColor: '#fff',
                    border: '2px dashed #8b5cf6',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#f5f3ff';
                }}
                onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#fff';
                }}
            >
                + Add New Address
            </button>
        </div>
    );

    return (
        <div className="checkout-page">
            {/* <NavSearch/> */}
            <div className="content-wrapper">
                <button 
                    onClick={() => {navigate('/homepage'); window.scrollTo(0, 0);}} 
                    style={{
                        color:'white',
                        backgroundColor:"purple",
                        padding:"10px",
                        borderRadius:"5px",
                        borderWidth:"0px",
                        cursor:"pointer",
                        height:"40px",
                        width:"70px",
                        position:"relative",
                        left:"-20px",
                        bottom:"20px"
                    }}
                >
                    Back
                </button>
                
                <div className="checkout-container">
                    <div className="form-section">
                        <div className="breadcrumb">
                            <span onClick={() => {navigate('/cart'); window.scrollTo(0, 0);}} style={{cursor:'pointer'}}>Shopping Bag</span> / <span className="current">Checkout</span>
                        </div>
                        <h1 className="main-title">Checkout</h1>
                        
                        <div className="form-group address-group">
                            {addressBlockContent}
                        </div>

                        <div className="form-group payment-group">
                            <h3 className="form-heading">Payment Method</h3>
                            <div className="radio-group">
                                <label className={`radio-label ${paymentMethod === 'creditCard' ? 'active' : ''}`}>
                                    <input type="radio" name="payment" value="creditCard" checked={paymentMethod === 'creditCard'} onChange={(e) => setPaymentMethod(e.target.value)} />
                                    Credit/Debit Card
                                </label>
                                <label className={`radio-label ${paymentMethod === 'upi' ? 'active' : ''}`}>
                                    <input type="radio" name="payment" value="upi" checked={paymentMethod === 'upi'} onChange={(e) => setPaymentMethod(e.target.value)} />
                                    UPI
                                </label>
                                <label className={`radio-label ${paymentMethod === 'cod' ? 'active' : ''}`}>
                                    <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={(e) => setPaymentMethod(e.target.value)} />
                                    Cash on Delivery
                                </label>
                            </div>

                            {paymentMethod === 'creditCard' && (
                                <div className="card-input-group">
                                    <input type="text" name="cardNumber" placeholder="Enter your card number" value={cardDetails.cardNumber} onChange={handleCardInputChange} required />
                                    <div className="split-input">
                                        <input type="text" name="expiryDate" placeholder="MM/YY" value={cardDetails.expiryDate} onChange={handleCardInputChange} required />
                                        <input type="text" name="cvv" placeholder="Enter CVV" value={cardDetails.cvv} onChange={handleCardInputChange} required />
                                    </div>
                                </div>
                            )}
                            {paymentMethod === 'upi' && (
                                <div className="upi-input-group">
                                    <input 
                                        type="text" 
                                        name="vpa" 
                                        placeholder="Enter UPI VPA (e.g., yourname@bank)" 
                                        required  
                                    />
                                    <button style={{position:"absolute",right:"10px",bottom:"30px",padding:"5px",backgroundColor:"green",color:"white",borderWidth:"0px",borderRadius:"5px"}}>Verify</button>
                                    <p className="upi-note">You will receive a payment request on this VPA after placing the order.</p>
                                </div>
                            )}
                            {paymentMethod === 'cod' && (
                                <div className="cod-info-group">
                                    <p className="cod-note">You have selected Cash on Delivery. Please keep the exact amount ready at the time of delivery.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="summary-section">
                        <h3 className="summary-title">Order Summary</h3>
                        <div className="order-items-scroll">
                            {cartItems.map((item) => (
                                <div className="order-item" key={item.id}>
                                    <div className="item-details">
                                        <img src={item.image} alt={item.name} className="item-image" />
                                        <div className="item-info">
                                            <div className="item-name">{item.name}</div>
                                            <div className="item-quantity">Qty: {item.quantity || 1}</div>
                                        </div>
                                    </div>
                                    <div className="item-price">₹{(item.price * item.quantity).toFixed(2)}</div>
                                </div>
                            ))}
                        </div>
                        <div className="summary-breakdown">
                            <div className="summary-row">
                                <span className="summary-label">Subtotal</span>
                                <span className="summary-value">₹{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="summary-row">
                                <span className="summary-label">Shipping</span>
                                <span className="summary-value">₹{shipping.toFixed(2)}</span>
                            </div>
                            <div className="summary-row tax-row">
                                <span className="summary-label">Estimated Tax (10%)</span>
                                <span className="summary-value">₹{taxes.toFixed(2)}</span>
                            </div>
                            <div className="summary-row total-row">
                                <span className="summary-label">Total</span>
                                <span className="summary-value total-value">₹{total.toFixed(2)}</span>
                            </div>
                        </div>
                        <button className="place-order-btn" onClick={handlePlaceOrder} disabled={!selectedAddressId}>
                            Place Order
                        </button>
                        <div className="secure-payment">
                            <svg className="lock-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 11V14M12 14V17M12 17C12.5523 17 13 16.5523 13 16C13 15.4477 12.5523 15 12 15C11.4477 15 11 15.4477 11 16C11 16.5523 11.4477 17 12 17Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <rect x="5" y="11" width="14" height="10" rx="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M7 11V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span>Safe & Secure Payment</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;