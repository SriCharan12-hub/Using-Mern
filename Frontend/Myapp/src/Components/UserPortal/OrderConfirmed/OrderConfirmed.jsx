import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import "./OrderConfirmed.css";

const OrderConfirmed = () => {
  // 1. State for fetched data, loading, and error
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 2. Fetch data from backend on component mount
  useEffect(() => {
    const fetchLastOrder = async () => {
      const token = Cookies.get("jwttoken");
      if (!token) {
        setError("User not logged in. Cannot fetch order details.");
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get("http://localhost:8000/cart", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        // 💡 CORRECTION: Access the array directly from res.data as shown in the image
        const cartItemsArray = res.data; 

        if (Array.isArray(cartItemsArray) && cartItemsArray.length > 0) {
          const fetchedItems = cartItemsArray.map((cartItem) => ({
            // Use cart item's own ID or product ID for key
            id: cartItem._id || cartItem.productId._id, 
            title: cartItem.productId.title,
            qty: cartItem.quantity,
            price: cartItem.productId.price, 
            image: cartItem.productId.image,
          }));
          
          const sub = fetchedItems.reduce(
            (sum, item) => sum + item.price * item.qty,
            0
          );
          const tax = 36.0; // Fixed tax value (should ideally come from backend)
          const totalAmount = sub + 0 + tax;

          const transformedOrderData = {
            // Using a unique temporary ID; replace with actual order ID from backend
            orderId: "#" + Math.random().toString(36).substring(2, 10).toUpperCase(), 
            items: fetchedItems,
            subtotal: sub,
            shipping: 0,
            taxes: tax,
            total: totalAmount,
            estimatedDelivery: "April 25, 2024", // Fixed delivery date
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

    fetchLastOrder();
  }, []);

  // 4. Loading and Error states for the UI
  if (loading) {
    return <div className="order-container loading-container">
        <div className="loader"></div>
        <p>Loading Order...</p>
    </div>;
  }

  if (error || !orderData || orderData.items.length === 0) {
    return (
      <div className="order-container">
        <div className="order-card error-card">
          <h1 className="order-title">Order Error 🙁</h1>
          <p className="order-message">{error || "No order details found."}</p>
          <button className="btn secondary" onClick={() => window.location.href = "/shop"}>
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  // 5. Destructure calculated values for cleaner render
  const { orderId, items, subtotal, shipping, taxes, total, estimatedDelivery } = orderData;

  // 6. Main Render
  return (
    <div className="order-container">
      <div className="order-card">
        <div className="order-icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="28"
          height="28"
          fill="white"
        >
          <path d="M20.285 6.709a1 1 0 0 0-1.414-1.418l-9.192 9.2-4.243-4.243a1 1 0 0 0-1.414 1.414l5 5a1 1 0 0 0 1.414 0l10-10Z" />
        </svg>
      </div>

        <h1 className="order-title">Order Confirmed! 🎉</h1>
        <p className="order-message">
          Thank you for your purchase. Your order is being processed.
        </p>
        <p className="order-number">
          Order Number: <span>{orderId}</span>
        </p>

        {/* Order summary */}
        <div className="order-summary">
          <h2 className="summary-heading">Order Summary</h2>

          {/* SCROLL CONTAINER for products */}
          <div className="order-items-scroll">
            {items.map((item) => (
              <div className="order-item" key={item.id}>
                <div className="item-left">
                  <img src={item.image} alt={item.title} />
                  <div>
                    <p className="item-title">{item.title}</p>
                    <p className="item-qty">Qty: {item.qty}</p>
                  </div>
                </div>
                {/* Display total price for the line item */}
                <span className="item-price">${(item.price * item.qty).toFixed(2)}</span> 
              </div>
            ))}
          </div>
          {/* END SCROLL CONTAINER */}

          <div className="summary-row">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>{shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}</span>
          </div>
          <div className="summary-row">
            <span>Taxes</span>
            <span>${taxes.toFixed(2)}</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Delivery */}
        <div className="delivery-box">
          <span>🚚 Estimated Delivery Date:</span>
          <span className="delivery-date">{estimatedDelivery}</span>
        </div>

        {/* Buttons */}
        <div className="order-actions">
          <button className="btn primary">View Order Details</button>
          <button className="btn secondary" onClick={() => window.location.href = "/"}>Continue Shopping</button>
          <button className="btn tertiary">Track Order</button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmed;