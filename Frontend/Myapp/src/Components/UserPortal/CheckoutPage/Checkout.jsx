import React, { useState, useEffect } from 'react';
import './Checkout.css';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import NavSearch from '../../AdminPortal/NavSearch/NavSearch'; // Assuming this is correct

const Checkout = () => {
    const navigate = useNavigate();
    const [userAddresses, setUserAddresses] = useState([]); // State for saved addresses
    const [selectedAddressId, setSelectedAddressId] = useState(null); // ID of the currently selected address
    const [isAddingNew, setIsAddingNew] = useState(false); // Flag for showing new address form
    const [newAddressDetails, setNewAddressDetails] = useState({ // State for the new/edit form
        fullName: '',
        Address: '', // Matches Mongoose schema capitalization
        City: '', // Matches Mongoose schema capitalization
        postalCode: '',
        PhoneNumber: '',
    });
    const [currentEditId, setCurrentEditId] = useState(null); // ID of address being edited

    const [paymentMethod, setPaymentMethod] = useState('creditCard');
    const [cardDetails, setCardDetails] = useState({ cardNumber: '', expiryDate: '', cvv: '' });
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- Order Calculations ---
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
    const shipping = 5.0; // Fixed shipping cost
    const taxes = subtotal * 0.10;
    const total = subtotal + shipping + taxes;

    const token = Cookies.get('jwttoken');
    const headers = { Authorization: `Bearer ${token}` };

  
    const fetchAddresses = async () => {
        if (!token) return;
        try {
            const res = await axios.get('http://localhost:8000/getaddress', { headers });
            const addresses = res.data.addresses || [];
            setUserAddresses(addresses);
            if (addresses.length > 0) {
                // Select the first address by default
                setSelectedAddressId(addresses[0]._id);
                // Also load the first address into the order details for consistency
                const firstAddress = addresses[0];
                setNewAddressDetails({
                    fullName: firstAddress.fullName,
                    Address: firstAddress.Address,
                    City: firstAddress.City,
                    postalCode: firstAddress.postalCode,
                    PhoneNumber: firstAddress.PhoneNumber,
                });
            }
        } catch (err) {
            console.error('Failed to fetch addresses:', err);
        }
    };

    // 2. Handle New/Edit Address Form Submission
    const handleSubmitAddress = async (e) => {
        e.preventDefault();
        if (!token) { alert("Please log in."); return; }

        const url = currentEditId
            ? `http://localhost:8000/updateaddress/${currentEditId}`
            : 'http://localhost:8000/addaddress';
        const method = currentEditId ? 'put' : 'post';
        
        try {
            const res = await axios[method](url, newAddressDetails, { headers });
            alert(res.data.message);
            
            // Reset form and close
            setNewAddressDetails({ fullName: '', Address: '', City: '', postalCode: '', PhoneNumber: '' });
            setIsAddingNew(false);
            setCurrentEditId(null);
            
            // Re-fetch list
            fetchAddresses();

        } catch (err) {
            console.error('Address submission failed:', err.response?.data || err);
            alert(`Failed to save address: ${err.response?.data?.message || "Check your input."}`);
        }
    };

    // 3. Handle Delete Address
    const handleDeleteAddress = async (id) => {
        if (!window.confirm("Are you sure you want to delete this address?")) return;
        if (!token) { alert("Please log in."); return; }

        try {
            const res = await axios.delete(`http://localhost:8000/address/deleteaddress/${id}`, { headers });
            alert(res.data.message);
            fetchAddresses();
        } catch (err) {
            console.error('Address deletion failed:', err.response?.data || err);
            alert('Failed to delete address.');
        }
    };
    
    // 4. Set Edit Mode
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

    // --- Data Fetching Effect ---
    useEffect(() => {
        if (!token) {
            setLoading(false);
            setError('Please log in to view your cart.');
            return;
        }

        const fetchCartAndAddresses = async () => {
            await fetchAddresses();
            
            try {
                const res = await axios.get('http://localhost:8000/cart', { headers });
                const data = res.data;
                let items = data.cart || data[0]?.items || data.items || [];
                
                const normalized = items.map(item => {
                    const product = item.productId || item.product;
                    return {
                        id: product?._id,
                        name: product?.title || product?.name || 'Unknown Product',
                        image: product?.image,
                        price: product?.price || 0,
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

    // --- Handlers for general form inputs ---

    const handleAddressFormChange = (e) => {
        const { name, value } = e.target;
        setNewAddressDetails(prev => ({ ...prev, [name]: value }));
    };

    const handleCardInputChange = (e) => {
        const { name, value } = e.target;
        setCardDetails({ ...cardDetails, [name]: value });
    };

    // --- Place Order Logic ---
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

            const response = await axios.post('http://localhost:8000/checkout', orderPayload, { headers });

            if (response.status === 201) {
                const newOrder = response.data.order; 
                navigate('/order-confirmed', { state: { order: newOrder } });
            }
        } catch (err) {
            console.error('Failed to place order:', err.response?.data || err.message);
            alert('Failed to place order. Please try again.');
        }
    };

    // --- Render Logic ---
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
            <input type="text" name="fullName" placeholder="Full Name" value={newAddressDetails.fullName} onChange={handleAddressFormChange} required />
            <input type="text" name="Address" placeholder="Address Line" value={newAddressDetails.Address} onChange={handleAddressFormChange} required />
            <div className="input-row split-input">
                <input type="text" name="City" placeholder="City" value={newAddressDetails.City} onChange={handleAddressFormChange} required />
                <input type="text" name="postalCode" placeholder="Postal Code" value={newAddressDetails.postalCode} onChange={handleAddressFormChange} maxLength="6" required />
            </div>
            <input type="tel" name="PhoneNumber" placeholder="Phone Number" value={newAddressDetails.PhoneNumber} onChange={handleAddressFormChange} maxLength="10" required />
            <div className="address-form-actions">
                <button type="submit" className="btn-primary">{currentEditId ? 'Save Changes' : 'Add Address'}</button>
                <button type="button" className="btn-secondary" onClick={() => { setIsAddingNew(false); setCurrentEditId(null); setNewAddressDetails({}); }}>Cancel</button>
            </div>
        </form>
    ) : (
        // Address Selection View
        <div className="address-selection-group">
            <h3 className="form-heading">Shipping Address</h3>
            {userAddresses.map(address => (
                <div 
                    key={address._id} 
                    className={`address-card ${selectedAddressId === address._id ? 'selected' : ''}`}
                    onClick={() => setSelectedAddressId(address._id)}
                >
                    <div className="address-details">
                        <input 
                            type="radio" 
                            name="addressSelection" 
                            checked={selectedAddressId === address._id} 
                            readOnly 
                        />
                        <div className="address-info">
                            <p className="address-name">{address.fullName} ({address.PhoneNumber})</p>
                            <p className="address-line">{address.Address}, {address.City} - {address.postalCode}</p>
                        </div>
                    </div>
                    <div className="address-actions">
                        <button className="btn-edit" onClick={(e) => { e.stopPropagation(); handleEditAddress(address); }}>Edit</button>
                        <button className="btn-delete" onClick={(e) => { e.stopPropagation(); handleDeleteAddress(address._id); }}>Delete</button>
                    </div>
                </div>
            ))}
            <button className="btn-add-new-address" onClick={() => { setIsAddingNew(true); setCurrentEditId(null); setNewAddressDetails({}); }}>+ Add New Address</button>
        </div>
    );

    return (
        <div className="checkout-page">
            <NavSearch/>
            <div className="content-wrapper">
                {/* <button onClick={() => navigate('/cart')} className="btn-back">← Back to Cart</button> */}
                <button onClick={()=>navigate('/homepage')} style={{color:'white',backgroundColor:"purple",padding:"10px",borderRadius:"5px",borderWidth:"0px",cursor:"pointer",height:"40px",width:"70px",position:"relative",left:"-20px",bottom:"20px"}}>Back</button>
               
                <div className="checkout-container">
                    
                    {/* Left side: Shipping and Payment */}
                    <div className="form-section">
                        <div className="breadcrumb">
                            <span onClick={()=>navigate('/cart')} style={{cursor:'pointer'}}>Shopping Bag</span> / <span className="current">Checkout</span>
                        </div>
                        <h1 className="main-title">Checkout</h1>
                        
                        {/* Shipping Address Section */}
                        <div className="form-group address-group">
                            {addressBlockContent}
                        </div>

                        {/* Payment Method Section */}
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
                              <p className="cod-note">You have selected **Cash on Delivery**. Please keep the exact amount ready at the time of delivery.</p>
                              </div>
                            )}    
                        </div>
                    </div>

                    {/* Right side: Order Summary */}
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