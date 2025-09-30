// import React, { useState, useEffect } from 'react';
// import './ShoppingCart.css';
// import axios from 'axios';
// import Cookies from 'js-cookie';
// import Navbar from '../../Navbar/Navbar';
// import { useNavigate } from 'react-router-dom';
// import NavSearch from '../../AdminPortal/NavSearch/NavSearch';

// const ShoppingCart = () => {
//     const navigate= useNavigate()
//     const [cartItems, setCartItems] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);

//     const fetchCartData = async () => {
//         const token = Cookies.get('jwttoken');
//         if (!token) {
//             setLoading(false);
//             setError('Please log in to view your cart.');
//             return;
//         }

//         try {
//             const response = await axios.get('http://localhost:8000/cart', {
//                 headers: { Authorization: `Bearer ${token}` }
//             });

//             // Correctly access the data
//             setCartItems(response.data.cart || []); 

//         } catch (err) {
//             console.error("Error fetching cart:", err);
//             setError('Failed to fetch cart. Please try again later.');
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchCartData();
//     }, []);

//     const handleIncrement = async (productId, currentQuantity) => {
//         const token = Cookies.get('jwttoken');
//         if (!token) return;

//         const newQuantity = currentQuantity + 1;
//         setCartItems(prevItems => prevItems.map(item =>
//             String(item.productId._id) === String(productId) ? { ...item, quantity: newQuantity } : item
//         ));
        
//         try {
//             await axios.put('http://localhost:8000/cart/item', { productId, quantity: newQuantity }, {
//                 headers: { Authorization: `Bearer ${token}` }
//             });
//         } catch (err) {
//             console.error('Failed to increment cart item (server)', err);
//             setCartItems(prevItems => prevItems.map(item =>
//                 String(item.productId._id) === String(productId) ? { ...item, quantity: currentQuantity } : item
//             ));
//         }
//     };

//     const handleDecrement = async (productId, currentQuantity) => {
//         const token = Cookies.get('jwttoken');
//         if (!token) return;

//         const newQuantity = currentQuantity - 1;
        
//         setCartItems(prevItems => {
//             if (newQuantity > 0) {
//                 return prevItems.map(item =>
//                     String(item.productId._id) === String(productId) ? { ...item, quantity: newQuantity } : item
//                 );
//             } else {
//                 return prevItems.filter(item => String(item.productId._id) !== String(productId));
//             }
//         });

//         try {
//             if (newQuantity > 0) {
//                 await axios.put('http://localhost:8000/cart/item', { productId, quantity: newQuantity }, {
//                     headers: { Authorization: `Bearer ${token}` }
//                 });
//             } else {
//                 await axios.delete('http://localhost:8000/cart/item', {
//                     headers: { Authorization: `Bearer ${token}` },
//                     data: { productId }
//                 });
//             }
//         } catch (err) {
//             console.error('Failed to decrement cart item (server)', err);
//             setCartItems(prevItems => prevItems.map(item =>
//                 String(item.productId._id) === String(productId) ? { ...item, quantity: currentQuantity } : item
//             ));
//         }
//     };
    
//     const removeItem = async (productId) => {
//         const token = Cookies.get('jwttoken');
//         if (!token) return;

        
//         setCartItems(prevItems => prevItems.filter(item => String(item.productId._id) !== String(productId)));
        
//         try {
//             await axios.delete('http://localhost:8000/cart/item', {
//                 headers: { Authorization: `Bearer ${token}` },
//                 data: { productId }
//             });
//         } catch (err) {
//             console.error('Failed to remove cart item (server)', err);
//             // Revert on failure
//             fetchCartData();
//             alert("Failed to remove item. Please try again.");
//         }
//     };
//     console.log(cartItems)
    
//     const subtotal = cartItems.reduce((sum, item) => sum + (Number(item.productId.price) || 0) * Number(item.quantity), 0);
//     const shipping = 5.0;
//     const estimatedTax = subtotal * 0.10;
//     const total = subtotal + shipping + estimatedTax;

//     if (loading) {
//         return <div className="loading-message">Loading cart...</div>;
//     }

//     if (error) {
//         return <div className="error-message">{error}</div>;
//     }

//     return (
       
//         <div className="cart-container">
//             <button onClick={()=>navigate('/homepage')} style={{color:'white',backgroundColor:"purple",padding:"10px",borderRadius:"5px",borderWidth:"0px",cursor:"pointer",height:"40px",width:"70px",position:"relative",left:"-120px",bottom:"20px"}}>Back</button>
//              <NavSearch/>
//              <div className='cartCon'>
//             <h1 className="main-title">Shopping Cart</h1>
//             {cartItems.length > 0 ? (
//                 <>
//                     <div className="cart-grid-headers">
//                         <span className="grid-header-product">Product</span>
//                         <span className="grid-header-price">Price</span>
//                         <span className="grid-header-quantity">Quantity</span>
//                         <span className="grid-header-total">Total</span>
//                     </div>
//                     <div className="cart-items">
//                         {cartItems.map((item) => (
//                             <div className="cart-item" key={item.productId._id}>
//                                 <div className="product-details-container">
//                                     <img src={item.productId.image} alt={item.productId.title} className="product-image" />
//                                     <div className="product-info">
//                                         <span className="product-title1">{item.productId.title}</span>
//                                         <span className="remove-link" onClick={() => removeItem(item.productId._id)}>Remove</span>
//                                     </div>
//                                 </div>
//                                 <span className="product-price">₹{item.productId.price.toFixed(2)}</span>
//                                 <div className="quantity-controls">
//                                     <button className="quantity-btn" onClick={() => handleDecrement(item.productId._id, item.quantity)}>-</button>
//                                     <span className="quantity-value">{item.quantity}</span>
//                                     <button className="quantity-btn" onClick={() => handleIncrement(item.productId._id, item.quantity)}>+</button>
//                                 </div>
//                                 <span className="product-total-price">
//                                     ₹{(item.productId.price * item.quantity).toFixed(2)}
//                                 </span>
//                             </div>
//                         ))}
//                     </div>
//                     <div className="summary-section">
//                         <h2 className="summary-title">Order Summary</h2>
//                         <div className="summary-row">
//                             <span>Subtotal</span>
//                             <span>₹{subtotal.toFixed(2)}</span>
//                         </div>
//                         <div className="summary-row">
//                             <span>Shipping</span>
//                             <span>₹{shipping.toFixed(2)}</span>
//                         </div>
//                         <div className="summary-row">
//                             <span>Estimated Tax (10%)</span>
//                             <span>₹{estimatedTax.toFixed(2)}</span>
//                         </div>
//                         <div className="summary-row total-row">
//                             <span>Total</span>
//                             <span className="total-value">₹{total.toFixed(2)}</span>
//                         </div>
//                         <button className="checkout-btn" onClick={()=>navigate('/checkout')}>Proceed to Checkout</button>
//                     </div>
//                 </>
//             ) 
//             : (
//                  <div className="empty-cart">
//                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="cart-icon">
//                 <path d="M2.25 2.25a.75.75 0 0 0 0 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 0 0-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 0 0 0-1.5H5.378A2.25 2.25 0 0 1 7.5 15h11.218a.75.75 0 0 0 .674-.421 60.358 60.358 0 0 0 2.96-7.228.75.75 0 0 0-.525-.965A60.864 60.864 0 0 0 5.68 4.509l-.232-.867A1.875 1.875 0 0 0 3.636 2.25H2.25ZM3.75 20.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM16.5 20.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z" />
//                 </svg>
//                 <p className="cart-para">Your Cart is Empty</p>
//                 </div>
                
//             )}
//             </div>
//         </div>
//     );
// };

// export default ShoppingCart;
import React, { useState, useEffect } from 'react';
import './ShoppingCart.css';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import NavSearch from '../../AdminPortal/NavSearch/NavSearch'; // Ensure this path is correct
// import { useCart } from '../../CartContext';

const ShoppingCart = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    

    const fetchCartData = async () => {
        const token = Cookies.get('jwttoken');
        if (!token) {
            setLoading(false);
            setError('Please log in to view your cart.');
            return;
        }
        try {
            const response = await axios.get('http://localhost:8000/cart', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const validItems = (response.data.cart || []).filter(item => item.productId);
            setCartItems(validItems);
        } catch (err) {
            console.error("Error fetching cart:", err);
            setError('Failed to fetch cart. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCartData();
    }, []);

 

    const handleIncrement = async (productId, currentQuantity) => {
        const token = Cookies.get('jwttoken');
        if (!token) return;
        const newQuantity = currentQuantity + 1;
        // Optimistic local update
        setCartItems(prev => prev.map(item => {
            const pid = item.productId && (item.productId._id || item.productId);
            return String(pid) === String(productId) ? { ...item, quantity: newQuantity } : item;
        }));
        try {
            await axios.put('http://localhost:8000/cart/item', { productId, quantity: newQuantity }, { headers: { Authorization: `Bearer ${token}` } });
            // Server confirmed; nothing else to do here for now
        } catch (err) {
            console.error('Increment failed', err);
            setCartItems(prev => prev.map(item => {
                const pid = item.productId && (item.productId._id || item.productId);
                return String(pid) === String(productId) ? { ...item, quantity: currentQuantity } : item;
            }));
        }
    };

    const handleDecrement = async (productId, currentQuantity) => {
        const token = Cookies.get('jwttoken');
        if (!token) return;
        const newQuantity = currentQuantity - 1;
        setCartItems(prev => {
            const next = newQuantity > 0
                ? prev.map(item => {
                    const pid = item.productId && (item.productId._id || item.productId);
                    return String(pid) === String(productId) ? { ...item, quantity: newQuantity } : item;
                })
                : prev.filter(item => {
                    const pid = item.productId && (item.productId._id || item.productId);
                    return String(pid) !== String(productId);
                });
            return next;
        });
        try {
            if (newQuantity > 0) {
                await axios.put('http://localhost:8000/cart/item', { productId, quantity: newQuantity }, { headers: { Authorization: `Bearer ${token}` } });
                
            } else {
                await axios.delete('http://localhost:8000/cart/item', { headers: { Authorization: `Bearer ${token}` }, data: { productId } });
             
            }
        } catch (err) {
            console.error('Decrement failed', err);
            fetchCartData(); // Re-fetch to ensure state consistency
        }
    };

    const removeItem = async (productId) => {
        const token = Cookies.get('jwttoken');
        if (!token) return;
        setCartItems(prev => prev.filter(item => {
            const pid = item.productId && (item.productId._id || item.productId);
            return String(pid) !== String(productId);
        }));
        try {
            await axios.delete('http://localhost:8000/cart/item', { headers: { Authorization: `Bearer ${token}` }, data: { productId } });
            fetchCartData();
        } catch (err) {
            console.error('Remove failed', err);
            fetchCartData(); // Re-fetch to ensure state consistency
        }
    };

    const subtotal = cartItems.reduce((sum, item) => sum + (item.productId?.price || 0) * (item.quantity || 1), 0);
    const shipping = 5.0;
    const estimatedTax = subtotal * 0.1;
    const total = subtotal + shipping + estimatedTax;

    if (loading) return <div className="loader-container"><div className="loader"></div><p>Loading...</p></div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="cart-container">
            <button className="back-btn" onClick={() => navigate('/homepage')}>Back</button>
            <NavSearch /> 
            <h1 className="main-title">Shopping Cart ({cartItems.reduce((s, it) => s + (it.quantity || 0), 0)} items)</h1>

            {cartItems.length === 0 ? (
                <div className="empty-cart">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="cart-icon">
                        <path d="M2.25 2.25a.75.75 0 0 0 0 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 0 0-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 0 0 0-1.5H5.378A2.25 2.25 0 0 1 7.5 15h11.218a.75.75 0 0 0 .674-.421 60.358 60.358 0 0 0 2.96-7.228.75.75 0 0 0-.525-.965A60.864 60.864 0 0 0 5.68 4.509l-.232-.867A1.875 1.875 0 0 0 3.636 2.25H2.25ZM3.75 20.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM16.5 20.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z" />
                    </svg>
                    <p className="cart-para">Your Cart is Empty</p>
                </div>
            ) : (
                <>
                    <table className="cart-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Price</th>
                                <th>Quantity</th>
                                <th>Total</th>
                                <th></th> {/* Empty header for the remove button column */}
                            </tr>
                        </thead>
                        <tbody>
                            {cartItems.map(item => (
                                <tr key={item._id}>
                                    <td className="product-cell">
                                        <img src={item.productId?.image} alt={item.productId?.title || "Product"} className="product-image1" />
                                        <div className="product-info-wrapper"> {/* NEW WRAPPER */}
                                            <span className="product-title1">{item.productId?.title || "Unnamed Product"}</span>
                                            <button className="remove-item-btn" onClick={() => removeItem(item.productId && (item.productId._id || item.productId))}>Remove</button>
                                        </div>
                                    </td>
                                    <td>₹{item.productId?.price?.toFixed(2) || "N/A"}</td>
                                    <td>
                                        <div className="quantity-controls">
                                            <button onClick={() => handleDecrement(item.productId && (item.productId._id || item.productId), item.quantity)}>-</button>
                                            <span>{item.quantity}</span>
                                            <button onClick={() => handleIncrement(item.productId && (item.productId._id || item.productId), item.quantity)}>+</button>
                                        </div>
                                    </td>
                                    <td>₹{(item.productId?.price * item.quantity)?.toFixed(2) || "N/A"}</td>
                                    <td></td> {/* Empty cell for alignment, remove button moved */}
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="summary-section">
                        <h2 className="summary-title">Order Summary</h2>
                        <div className="summary-row"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
                        <div className="summary-row"><span>Shipping</span><span>₹{shipping.toFixed(2)}</span></div>
                        <div className="summary-row"><span>Estimated Tax (10%)</span><span>₹{estimatedTax.toFixed(2)}</span></div>
                        <div className="summary-row total-row"><span>Total</span><span>₹{total.toFixed(2)}</span></div>
                        <button className="checkout-btn" onClick={() => navigate('/checkout')}>Proceed to Checkout</button>
                    </div>
                </>
            )}
        </div>
    );
};

export default ShoppingCart;