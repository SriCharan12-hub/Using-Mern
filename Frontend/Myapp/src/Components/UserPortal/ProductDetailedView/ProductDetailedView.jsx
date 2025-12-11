import React, { useState, useEffect } from "react";
import "./ProductDetailedView.css";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from 'react-redux';
import { addToCart as addToCartAction, decrementQuantity, removeFromCart as removeFromCartAction } from '../../../Slice';
import Navbar from '../../Navbar/Navbar';

const ProductDetailView = () => {
  const navigate = useNavigate();
  const { productId } = useParams();
  const dispatch = useDispatch();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState({});
  const [wishlist, setWishlist] = useState([]);
  const [selectedImage, setSelectedImage] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("cart");
      if (stored) {
        setCart(JSON.parse(stored));
      }
    } catch {
      // ignore localStorage errors
    }
  }, []);

  useEffect(() => {
    const fetchProductDetails = async () => {
      const token = Cookies.get("jwttoken");
      try {
        const productResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/products/get`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        const foundProduct = productResponse.data.products.find(
          (p) => p._id === productId
        );
        
        if (!foundProduct) {
          setError("Product not found");
          setLoading(false);
          return;
        }
        
        console.log("Found Product:", foundProduct);
        console.log("Product Images:", foundProduct.images);
        console.log("Product Image:", foundProduct.image);
        
        setProduct(foundProduct);
        
        // Set first image - check images array first, then single image field
        const firstImage = (foundProduct.images && foundProduct.images.length > 0) 
          ? foundProduct.images[0] 
          : foundProduct.image;
        
        setSelectedImage(firstImage);

        if (token) {
          const [cartResponse, wishlistResponse] = await Promise.all([
            axios.get(`${import.meta.env.VITE_API_URL}/cart`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get(`${import.meta.env.VITE_API_URL}/wishlist/get`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

          const cartData = cartResponse.data;
          let cartItems = [];

          if (Array.isArray(cartData)) {
            cartItems = cartData[0]?.items || [];
          } else if (cartData.cart) {
            cartItems = cartData.cart || [];
          } else if (cartData.items) {
            cartItems = cartData.items || [];
          }

          const cartObject = {};
          cartItems.forEach((item) => {
            const pid = item.productId && (item.productId._id || item.productId);
            if (pid) cartObject[String(pid)] = item.quantity || 0;
          });

          setCart(cartObject);
          setWishlist(wishlistResponse.data.wishlist || []);
        }
      } catch (err) {
        setError("Failed to fetch product details. Please try again later.");
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId]);

  const handleAddToCart = async () => {
    const token = Cookies.get("jwttoken");
    if (!token) {
      alert("Please log in to add items to your cart.");
      return;
    }
    const productIdStr = String(product._id);
    const existingQuantity = cart[productIdStr] || 0;
    setCart((prevCart) => ({ ...prevCart, [productIdStr]: existingQuantity + 1 }));
    try { dispatch(addToCartAction({ productId: productIdStr })); } catch (e) { console.debug('optimistic add failed', e); }
    
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/cart/add`,
        { productId: productIdStr, quantity: existingQuantity + 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      localStorage.setItem("cart", JSON.stringify({ ...cart, [productIdStr]: existingQuantity + 1 }));
    } catch (err) {
      console.error("Failed to add to cart (server)", err);
      setCart((prevCart) => ({ ...prevCart, [productIdStr]: existingQuantity }));
      alert("Failed to add item to cart. Please try again.");
    }
  };

  const handleRemoveFromCart = async () => {
    const token = Cookies.get("jwttoken");
    if (!token) return;
    const productIdStr = String(product._id);
    const existingQuantity = cart[productIdStr] || 0;
    const newQuantity = existingQuantity - 1;
    
    setCart((prevCart) => {
      const nextCart = { ...prevCart };
      if (newQuantity > 0) {
        nextCart[productIdStr] = newQuantity;
      } else {
        delete nextCart[productIdStr];
      }
      return nextCart;
    });
    
    try {
      if (newQuantity > 0) {
        dispatch(decrementQuantity(productIdStr));
      } else {
        dispatch(removeFromCartAction(productIdStr));
      }
    } catch (e) { console.debug('optimistic remove failed', e); }
    
    try {
      if (newQuantity > 0) {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/cart/item`,
          { productId: productIdStr, quantity: newQuantity },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.delete(`${import.meta.env.VITE_API_URL}/cart/item`, {
          headers: { Authorization: `Bearer ${token}` },
          data: { productId: productIdStr },
        });
      }
    } catch (err) {
      console.error("Failed to remove cart item (server)", err);
      alert("Failed to update cart. Please try again.");
    }
  };

  const handleAddToWishlist = async () => {
    const token = Cookies.get("jwttoken");
    if (!token) {
      alert("Please log in to add items to your wishlist.");
      return;
    }
    const productIdStr = String(product._id);
    const isAlreadyInWishlist = wishlist.some(
      (item) => String(item.productId) === productIdStr
    );
    
    if (isAlreadyInWishlist) {
      alert("This item is already in your wishlist!");
      return;
    }
    
    setWishlist((prevWishlist) => [
      ...prevWishlist,
      { productId: productIdStr, product },
    ]);
    
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/wishlist/add`,
        { productId: productIdStr },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Failed to add to wishlist (server)", err);
      setWishlist((prevWishlist) =>
        prevWishlist.filter((item) => String(item.productId) !== productIdStr)
      );
      alert("Failed to add to wishlist. Please try again.");
    }
  };

  const handleRemoveFromWishlist = async () => {
    const token = Cookies.get("jwttoken");
    if (!token) return;
    const productIdStr = String(product._id);
    
    setWishlist((prevWishlist) =>
      prevWishlist.filter((item) => String(item.productId) !== productIdStr)
    );
    
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/wishlist/remove`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { productId: productIdStr },
      });
    } catch (err) {
      console.error("Failed to remove from wishlist (server)", err);
      alert("Failed to remove from wishlist. Please try again.");
    }
  };

  const isProductInWishlist = () =>
    product && wishlist.some((item) => String(item.productId) === String(product._id));

  // Get all product images (from images array or fallback to single image)
  const getProductImages = () => {
    if (!product) return [];
    
    // If images array exists and has items, use it
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      console.log("Using images array:", product.images);
      return product.images;
    }
    
    // Otherwise, fallback to single image field
    if (product.image) {
      console.log("Using single image field:", product.image);
      return [product.image];
    }
    
    console.log("No images found");
    return [];
  };

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="error-container">
        <Navbar />
        <div className="error">{error || "Product not found"}</div>
        <button onClick={() => navigate(-1)} className="back-button" style={{cursor: "pointer"}}>
          Go Back
        </button>
      </div>
    );
  }

  const productImages = getProductImages();
  console.log("Product Images to Display:", productImages);

  return (
    <div className="product-detail-page">
      <Navbar />
      <div className="product-detail-container">
        <button onClick={() => navigate(-1)} className="back-button">
          ← Back
        </button>

        <div className="product-detail-content">
          <div className="product-images-section">
            <div className="main-image-container">
              <img src={selectedImage} alt={product.title} className="main-product-image" />
              <button
                className={`wishlist-icon-detail ${isProductInWishlist() ? "added" : ""}`}
                onClick={isProductInWishlist() ? handleRemoveFromWishlist : handleAddToWishlist}
              >
                {isProductInWishlist() ? "❤️" : "🤍"}
              </button>
            </div>
            
            {productImages.length > 0 && (
              <div className="thumbnail-images">
                {productImages.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`${product.title} - ${index + 1}`}
                    className={`thumbnail ${selectedImage === img ? "active" : ""}`}
                    onClick={() => setSelectedImage(img)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="product-info-section">
            <h1 className="product-detail-title">{product.title}</h1>
    
            <div className="product-price-section">
              <span className="product-detail-price">₹{product.price}</span>
              {Number(product.count) > 0 ? (
                <span className="stock-available-detail">In stock</span>
              ) : (
                <span className="out-of-stock-detail">Out of stock</span>
              )}
            </div>

            <div className="product-description">
              <h3>Description</h3>
              <p>{product.description}</p>
            </div>

            <div className="product-details-info">
              <h3>Product Details</h3>
              <ul>
                <li><strong>Category:</strong> {product.category}</li>
                {product.rating && (
                  <li><strong>Rating:</strong> {product.rating.rate} / 5</li>
                )}
                
              </ul>
            </div>

            <div className="product-actions-detail">
              {cart[String(product._id)] ? (
                <div className="cart-counter-detail">
                  <button onClick={handleRemoveFromCart} className="counter-btn">-</button>
                  <span className="counter-value">{cart[String(product._id)]}</span>
                  <button 
                    onClick={() => {
                      // prevent increment if out of stock
                      const available = Number(product.count) || Infinity;
                      const current = cart[String(product._id)] || 0;
                      if (current < available) handleAddToCart();
                    }}
                    className="counter-btn"
                    disabled={Number(product.count) > 0 ? (cart[String(product._id)] || 0) >= Number(product.count) : false}
                  >+
                  </button>
                </div>
              ) : (
                Number(product.count) > 0 ? (
                  <button className="add-to-cart-btn-detail" onClick={handleAddToCart}>
                    Add to Cart
                  </button>
                ) : (
                  <button className="add-to-cart-btn-detail out-of-stock-btn" disabled>
                    Out of Stock
                  </button>
                )
              )}
              
              <button 
                className={`add-to-wishlist-btn ${isProductInWishlist() ? "in-wishlist" : ""}`}
                onClick={isProductInWishlist() ? handleRemoveFromWishlist : handleAddToWishlist}
              >
                {isProductInWishlist() ? "Remove from Wishlist" : "Add to Wishlist"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailView;