import React, { useState, useEffect } from "react";
import "./MensFashion.css";
import Navbar from "../../Navbar/Navbar";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart as addToCartAction } from "../../../Slice";

const MensFashion = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState({});
  const [wishlist, setWishlist] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPriceRange, setSelectedPriceRange] = useState("All Prices");
  const [sortOrder, setSortOrder] = useState("Newest Arrivals");
  const productsPerPage = 4;
  
  const dispatch = useDispatch();

  useEffect(() => {
    try {
      const stored = localStorage.getItem("cart");
      if (stored) setCart(JSON.parse(stored));
    } catch (e) {
      console.warn("Failed to read cart from localStorage", e);
    }
  }, []);
   const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedColor, setSelectedColor] = useState('');
  

  // Reset Filters function
  const resetFilters = () => {
    setSelectedCategory('All');
    setSelectedColor('');
    setSelectedPriceRange(34000);
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = Cookies.get("jwttoken");
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/products/get`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const list = (res.data.products || []).filter(
          (p) => p.category === "men's clothing"
        );
        setProducts(list);
        setFilteredProducts(list);

        if (token) {
          const [cartRes, wishRes] = await Promise.all([
            axios.get(`${import.meta.env.VITE_API_URL}/cart`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get(`${import.meta.env.VITE_API_URL}/wishlist/get`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);
          const cartItems = Array.isArray(cartRes.data)
            ? cartRes.data[0]?.items || []
            : cartRes.data.items || cartRes.data.cart || [];
          const cartObj = {};
          cartItems.forEach((i) => {
            const pid = i.productId && (i.productId._id || i.productId);
            if (pid) cartObj[String(pid)] = i.quantity || 0;
          });
          setCart(cartObj);
          setWishlist(wishRes.data.wishlist || []);
        }
      } catch (err) {
        console.error("Failed to load products", err);
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let list = [...products];
    if (selectedPriceRange !== "All Prices") {
      const [min, max] = selectedPriceRange.split("-").map(Number);
      list = list.filter((p) => p.price >= min && p.price <= max);
    }
    if (sortOrder === "Low to High") list.sort((a, b) => a.price - b.price);
    else if (sortOrder === "High to Low")
      list.sort((a, b) => b.price - a.price);
    setFilteredProducts(list);
    setCurrentPage(1);
  }, [products, selectedPriceRange, sortOrder]);

  const isProductInWishlist = (id) =>
    wishlist.some((item) => String(item.productId) === String(id));

  const handleAddToCart = async (product, e) => {
    if (e) e.stopPropagation();
    const token = Cookies.get("jwttoken");
    if (!token) return alert("Please login");
    const pid = String(product._id);
    const existing = cart[pid] || 0;
    const available = Number(product.count) || Infinity;
    if (existing >= available) return alert("No more stock available");
    const nextCart = { ...cart, [pid]: existing + 1 };
    setCart(nextCart);
    try {
      dispatch(addToCartAction({ productId: pid }));
    } catch (e) {
      console.warn("dispatch addToCart failed", e);
    }
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/cart/add`,
        { productId: pid, quantity: existing + 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      try {
        localStorage.setItem("cart", JSON.stringify(nextCart));
      } catch (e) {
        console.warn("localStorage setItem failed", e);
      }
    } catch (err) {
      console.error(err);
      setCart(cart);
      alert("Failed to add item to cart.");
    }
  };

  const handleRemoveFromCart = async (productId, e) => {
    if (e) e.stopPropagation();
    const token = Cookies.get("jwttoken");
    if (!token) return;
    const existing = cart[productId] || 0;
    const next = existing - 1;
    const nextCart = { ...cart };
    if (next > 0) nextCart[productId] = next;
    else delete nextCart[productId];
    setCart(nextCart);
    try {
      if (next > 0)
        await axios.put(
          `${import.meta.env.VITE_API_URL}/cart/item`,
          { productId, quantity: next },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      else
        await axios.delete(`${import.meta.env.VITE_API_URL}/cart/item`, {
          headers: { Authorization: `Bearer ${token}` },
          data: { productId },
        });
      try {
        localStorage.setItem("cart", JSON.stringify(nextCart));
      } catch (e) {
        console.warn("localStorage setItem failed", e);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update cart.");
    }
  };

  const handleAddToWishlist = async (product, e) => {
    if (e) e.stopPropagation();
    const token = Cookies.get("jwttoken");
    if (!token) return alert("Please log in to add items to your wishlist.");
    const productId = String(product._id);
    if (isProductInWishlist(productId)) return alert("Already in wishlist");
    setWishlist((prev) => [...prev, { productId, product }]);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/wishlist/add`,
        { productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error(err);
      setWishlist((prev) =>
        prev.filter((item) => String(item.productId) !== productId)
      );
      alert("Failed to add to wishlist");
    }
  };

  const handleRemoveFromWishlist = async (productId, e) => {
    if (e) e.stopPropagation();
    const token = Cookies.get("jwttoken");
    if (!token) return;
    setWishlist((prev) =>
      prev.filter((item) => String(item.productId) !== productId)
    );
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/wishlist/remove`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { productId },
      });
    } catch (err) {
      console.error(err);
      alert("Failed to remove from wishlist");
    }
  };

  const handleProductClick = (productId) => navigate(`/product/${productId}`);

  const indexOfLast = currentPage * productsPerPage;
  const indexOfFirst = indexOfLast - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / productsPerPage)
  );

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPageNumbers = () =>
    Array.from({ length: totalPages }).map((_, i) => (
      <button
        key={i + 1}
        className={`page-number ${currentPage === i + 1 ? "active" : ""}`}
        onClick={() => paginate(i + 1)}
      >
        {i + 1}
      </button>
    ));

  if (loading)
    return (
      <div className="loader-container">
        <div className="loader" />
      </div>
    );
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="product-page">
      <Navbar />
      <div className="main-content">
        <div className="content-side">
          <button className="back-btn" onClick={()=>navigate('/homepage')}>Back</button>
          <aside
                        className="filters-sidebar"
                        style={{ marginTop: '40px', marginLeft: '0px' }}
                    >
                        <h2>Filters</h2>
                        <div className="filter-group">
                            <label htmlFor="price">Price Range</label>
                            <select
                                id="price"
                                value={selectedPriceRange}
                                onChange={(e) => setSelectedPriceRange(e.target.value)}
                            >
                                <option>All Prices</option>
                                <option value="0-100">0 - ₹100</option>
                                <option value="101-500">₹101 - ₹500</option>
                                <option value="501-1000">₹501 - ₹1000</option>
                                <option value="1001-999999">Over ₹1000</option>
                            </select>
                        </div>
                        <div className="filter-group">
                            <label htmlFor="sort">Sort by:</label>
                            <select
                                id="sort"
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                            >
                                <option value="Newest Arrivals">Newest Arrivals</option>
                                <option value="Low to High">Price: Low to High</option>
                                <option value="High to Low">Price: High to Low</option>
                            </select>
                        </div>
                    </aside>
        </div>

        <main className="product-listing">
          <div className="listing-header">
            <h1 className="category-title">Men's Fashion</h1>
          </div>
          <div className="product-grid-new">
            {currentProducts.length === 0 ? (
              <div className="no-products-container">No products</div>
            ) : (
              currentProducts.map((product) => {
                const inStock = Number(product.count) > 0;
                return (
                  <div
                    className="product-card-new"
                    key={product._id}
                    onClick={() => {
                      handleProductClick(product._id);
                      window.scrollTo(0, 0);
                    }}
                  >
                    <div className="product-image-section">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="product-image-new"
                      />
                      <button
                        className={`wishlist-button-new ${
                          isProductInWishlist(product._id) ? "active" : ""
                        }`}
                        onClick={(e) =>
                          isProductInWishlist(product._id)
                            ? handleRemoveFromWishlist(String(product._id), e)
                            : handleAddToWishlist(product, e)
                        }
                      >
                        {isProductInWishlist(product._id) ? "❤️" : "🤍"}
                      </button>
                    </div>
                    <div className="product-info-section">
                      <div className="product-category-badge">
                        {product.category || "Fashion"}
                      </div>
                      <h3 className="product-title-new">{product.title}</h3>

                      <div className="product-bottom-section">
                        <div className="price-stock-section">
                          <span className="product-price-new">
                            ₹{product.price}
                          </span>
                          {inStock ? (
                            <span className="stock-available">In stock</span>
                          ) : (
                            <span className="out-of-stock">Out of stock</span>
                          )}
                        </div>
                        <div className="product-actions-section">
                          {cart[String(product._id)] ? (
                            <div className="cart-quantity-control">
                              <button
                                className="minus quantity-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveFromCart(String(product._id), e);
                                }}
                              >
                                -
                              </button>
                              <span className="quantity-display">
                                {cart[String(product._id)]}
                              </span>
                              <button
                                className="plus quantity-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const available =
                                    Number(product.count) || Infinity;
                                  const current =
                                    cart[String(product._id)] || 0;
                                  if (current < available)
                                    handleAddToCart(product, e);
                                }}
                                disabled={
                                  !inStock ||
                                  (Number(product.count) &&
                                    (cart[String(product._id)] || 0) >=
                                      Number(product.count))
                                }
                              >
                                +
                              </button>
                            </div>
                          ) : inStock ? (
                            <button
                              className="add-cart-button-new"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddToCart(product, e);
                              }}
                            >
                              Add to Cart
                            </button>
                          ) : (
                            <button
                              className="add-cart-button-new out-of-stock-btn"
                              disabled
                            >
                              Out of Stock
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {filteredProducts.length > 0 && (
            <div className="pagination">
              <button
                className={`page-arrow ${currentPage === 1 ? "disabled" : ""}`}
                onClick={() => currentPage > 1 && paginate(currentPage - 1)}
              >
                &lt;
              </button>
              {renderPageNumbers()}
              <button
                className={`page-arrow ${
                  currentPage === totalPages ? "disabled" : ""
                }`}
                onClick={() =>
                  currentPage < totalPages && paginate(currentPage + 1)
                }
              >
                &gt;
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MensFashion;
