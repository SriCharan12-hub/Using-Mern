// src/Components/ShoppingCart/ShoppingCart.jsx
import React, { useEffect } from "react";
import "./ShoppingCart.css";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setCart,incrementQuantity,decrementQuantity,setError,setLoading,removeFromCart } from "../../../Slice";
import NavSearch from "../../AdminPortal/NavSearch/NavSearch";

const ShoppingCart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get cart state from Redux with fallback
  const cartState = useSelector((state) => state?.cart);
  const cartItems = cartState?.cartItems || [];
  const loading = cartState?.loading || false;
  const error = cartState?.error || null;
  const totalQuantity = cartState?.totalQuantity || 0;

  useEffect(() => {
    fetchCartData();
  }, []);

  const fetchCartData = async () => {
    const token = Cookies.get("jwttoken");
    
    dispatch(setLoading(true));

    if (!token) {
      dispatch(setError("Please log in to view your cart."));
      dispatch(setLoading(false));
      return;
    }

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/cart`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const validItems = (response.data.cart || []).filter(
        (item) => item.productId
      );

      // Update Redux store with fetched cart data
      dispatch(setCart(validItems));
      dispatch(setError(null));
    } catch (err) {
      console.error("Error fetching cart:", err);
      dispatch(setError("Failed to fetch cart. Please try again later."));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleIncrement = async (productId) => {
    const token = Cookies.get("jwttoken");
    if (!token) {
      dispatch(setError("Please log in to continue."));
      return;
    }

    // Get current quantity from Redux
    const currentItem = cartItems.find(
      (item) =>
        String(item.productId._id || item.productId) === String(productId)
    );
    const newQuantity = (currentItem?.quantity || 0) + 1;

    // Optimistic update
    dispatch(incrementQuantity(productId));

    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/cart/item`,
        { productId, quantity: newQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Increment failed", err);
      // Revert on failure by refetching
      fetchCartData();
      dispatch(setError("Failed to update cart. Please try again."));
    }
  };

  const handleDecrement = async (productId) => {
    const token = Cookies.get("jwttoken");
    if (!token) {
      dispatch(setError("Please log in to continue."));
      return;
    }

    // Get current quantity from Redux
    const currentItem = cartItems.find(
      (item) =>
        String(item.productId._id || item.productId) === String(productId)
    );
    const currentQuantity = currentItem?.quantity || 1;
    const newQuantity = currentQuantity - 1;

    // Optimistic update
    if (newQuantity > 0) {
      dispatch(decrementQuantity(productId));
    } else {
      dispatch(removeFromCart(productId));
    }

    try {
      if (newQuantity > 0) {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/cart/item`,
          { productId, quantity: newQuantity },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.delete(`${import.meta.env.VITE_API_URL}/cart/item`, {
          headers: { Authorization: `Bearer ${token}` },
          data: { productId },
        });
      }
    } catch (err) {
      console.error("Decrement failed", err);
      fetchCartData();
      dispatch(setError("Failed to update cart. Please try again."));
    }
  };

  const handleRemoveItem = async (productId) => {
    const token = Cookies.get("jwttoken");
    if (!token) {
      dispatch(setError("Please log in to continue."));
      return;
    }

    // Optimistic update
    dispatch(removeFromCart(productId));

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/cart/item`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { productId },
      });
    } catch (err) {
      console.error("Remove failed", err);
      fetchCartData();
      dispatch(setError("Failed to remove item. Please try again."));
    }
  };

  // Calculate totals from Redux state
  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.productId?.price || 0) * (item.quantity || 1),
    0
  );
  const shipping = 5.0;
  const estimatedTax = subtotal * 0.1;
  const total = subtotal + shipping + estimatedTax;

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (error && cartItems.length === 0) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="cart-container">
      <button
        className="back-btn"
        onClick={() => {
          navigate("/homepage");
          window.scrollTo(0, 0);
        }}
      >
        Back
      </button>

      <h1 className="main-title">Shopping Cart ({totalQuantity} items)</h1>

      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="cart-icon"
          >
            <path d="M2.25 2.25a.75.75 0 0 0 0 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 0 0-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 0 0 0-1.5H5.378A2.25 2.25 0 0 1 7.5 15h11.218a.75.75 0 0 0 .674-.421 60.358 60.358 0 0 0 2.96-7.228.75.75 0 0 0-.525-.965A60.864 60.864 0 0 0 5.68 4.509l-.232-.867A1.875 1.875 0 0 0 3.636 2.25H2.25ZM3.75 20.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM16.5 20.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z" />
          </svg>
          <p className="cart-para">Your Cart is Empty</p>
        </div>
      ) : (
        <>
          <table className="cart-table">
            <thead>
              <tr>
                <th className="display-product">Product</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item) => (
                <tr key={item._id}>
                  <td className="product-cell">
                    <img
                      src={item.productId?.image}
                      alt={item.productId?.title || "Product"}
                      className="product-image1"
                    />
                    <div className="product-info-wrapper">
                      <p className="product-title1">
                        {item.productId?.title || "Unnamed Product"}
                      </p>
                      <button
                        className="remove-item-btn"
                        onClick={() =>
                          handleRemoveItem(
                            item.productId &&
                              (item.productId._id || item.productId)
                          )
                        }
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                 
                  <td className="detailing-price">₹{item.productId?.price?.toFixed(2) || "N/A"}</td>
                  <td>
                    <div className="quantity-controls">
                      <button
                        onClick={() =>
                          handleDecrement(
                            item.productId &&
                              (item.productId._id || item.productId)
                          )
                        }
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() =>
                          handleIncrement(
                            item.productId &&
                              (item.productId._id || item.productId)
                          )
                        }
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="detailing-totalprice">
                    ₹
                    {(item.productId?.price * item.quantity)?.toFixed(2) ||
                      "N/A"}
                  </td>
                  <td></td>
                
                </tr>
              ))}
            </tbody>
          </table>

          {error && <div className="error-message">{error}</div>}

          <div className="summary-section">
            <h2 className="summary-title">Order Summary</h2>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>₹{shipping.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Estimated Tax (10%)</span>
              <span>₹{estimatedTax.toFixed(2)}</span>
            </div>
            <div className="summary-row total-row">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
            <button
              className="checkout-btn"
              onClick={() => {
                navigate("/checkout");
                window.scrollTo(0, 0);
              }}
            >
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ShoppingCart;