import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import "./OrderConfirmed.css";
import { useNavigate, useLocation } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa";  

// ✅ Set your correct API base URL here
const API_BASE_URL = `${import.meta.env.VITE_API_URL}`; // Change to your actual backend port

const OrderConfirmed = () => {
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if order data was passed from checkout page
    const orderFromCheckout = location.state?.order;
    console.log("Order from checkout:", orderFromCheckout);
    
    if (orderFromCheckout) {
      const transformedOrderData = {
        orderId: orderFromCheckout._id || "#" + Math.random().toString(36).substring(2, 10).toUpperCase(),
        items: orderFromCheckout.items?.map(item => ({
          id: item.productId?._id || item.productId || item.id,
          title: item.productId?.title || item.title || "Product",
          qty: item.quantity || 1,
          price: item.priceAtOrder || item.price || 0,
          image: item.productId?.image || item.image || "",
        })) || [],
        subtotal: orderFromCheckout.totalAmount ? (orderFromCheckout.totalAmount - 5 - (orderFromCheckout.totalAmount - 5) * 0.10 / 1.10) : 0,
        shipping: 5.0,
        taxes: orderFromCheckout.totalAmount ? (orderFromCheckout.totalAmount - 5) * 0.10 / 1.10 : 0,
        total: orderFromCheckout.totalAmount || 0,
      };
      setOrderData(transformedOrderData);
      setLoading(false);
    } else {
      // Fallback: Fetch from cart if no order data was passed
      fetchOrderFromCart();
    }
  }, [location]);

  const fetchOrderFromCart = async () => {
    const token = Cookies.get("jwttoken");
    if (!token) {
      setError("User not logged in. Cannot fetch order details.");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(`${API_BASE_URL}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const cartItemsArray = res.data.cart || [];

      if (Array.isArray(cartItemsArray) && cartItemsArray.length > 0) {
        const fetchedItems = cartItemsArray
          .filter((item) => item.productId)
          .map((cartItem) => ({
            id: cartItem._id || cartItem.productId?.id,
            title: cartItem.productId?.title ?? "No title",
            qty: cartItem.quantity,
            price: cartItem.productId?.price ?? 0,
            image: cartItem.productId?.image ?? "",
          }));

        const sub = fetchedItems.reduce(
          (sum, item) => Number(sum) + Number(item.price * item.qty),
          0
        );
        const shippingCost = 5.0;
        const tax = sub * 0.10;
        const totalAmount = sub + shippingCost + tax;

        const transformedOrderData = {
          orderId: "#" + Math.random().toString(36).substring(2, 10).toUpperCase(),
          items: fetchedItems,
          subtotal: sub,
          shipping: shippingCost,
          taxes: tax,
          total: totalAmount,
        };

        setOrderData(transformedOrderData);
      } else {
        setError("No items found in the order. Your cart was likely empty.");
      }
    } catch (err) {
      console.error("Error fetching order data:", err);
      setError("Failed to load order details. Please check your network connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleContinueShopping = async () => {
    const token = Cookies.get("jwttoken");
    
    if (!token) {
      navigate("/homepage");
      return;
    }

    try {
      // ✅ FIXED: Use the correct endpoint from your order routes
      await axios.delete(`${import.meta.env.VITE_API_URL}/clear-cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Cart cleared successfully");
      navigate("/feedback");
      window.scrollTo(0, 0);
    } catch (err) {
      console.error("Failed to clear cart:", err);
      // Navigate anyway even if cart clear fails
      navigate("/homepage");
      window.scrollTo(0, 0);
    }
  };

  if (loading) {
    return (
      <div className="order-container loading-container">
        <div className="loader"></div>
        <p>Loading Order...</p>
      </div>
    );
  }

  if (error || !orderData || (orderData?.items ?? []).length === 0) {
    return (
      <div className="order-container">
        <div className="order-card error-card">
          <h1 className="order-title">Order Error 🙁</h1>
          <p className="order-message">{error || "No order details found."}</p>
          <button
            className="btn secondary"
            onClick={handleContinueShopping}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const {
    orderId,
    items = [],
    subtotal,
    shipping,
    taxes,
    total,
  } = orderData ?? {};


  const handleClick = () => {
    window.open("https://wa.me/7675904571?text=Hello!%20I%20want%20to%20confirm%20my%20order.", "_blank");
  };
  

  return (
    <div className="order-container">
   
      <div className="order-card">
       <div className="checkmark-container">
          <svg className="checkmark" viewBox="0 0 52 52">
          <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="#e0f7e0" />
          <path
            className="checkmark-check"
            fill="none"
            d="M14.1 27.2l7.1 7.2 16.8-16.8"
          />
          </svg>
      </div>
        <h1 className="order-title">Order Confirmed! 🎉</h1>
        <p className="order-message">
          Thank you for your purchase. Your order is being processed.
        </p>
        <p className="order-number">
          Order Number: <span>{orderId}</span>
        </p>

        <div className="order-summary">
          <h2 className="summary-heading">Order Summary</h2>

          <div className="order-items-scroll">
            {items.map((item, index) => (
              <div className="order-item" key={item.id || index}>
                <div className="item-left">
                  <img src={item.image} alt={item.title} />
                  <div>
                    <p className="item-title">{item.title}</p>
                    <p className="item-qty">Qty: {item.qty}</p>
                  </div>
                </div>
                <span className="item-price">
                  ₹{(item.price * item.qty).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

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
            <span>₹{taxes.toFixed(2)}</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </div>

        <div className="order-actions">
           <button className="whatsapp-button" onClick={handleClick}>
            <FaWhatsapp className="whatsapp-icon" />
            Chat on WhatsApp to Confirm Order
          </button>
          <button className="btn secondary" onClick={handleContinueShopping}>
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmed;