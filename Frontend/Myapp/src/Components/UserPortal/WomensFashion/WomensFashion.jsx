import React, { useState, useEffect } from 'react';
import './WomensFashion.css';
import Navbar from '../../Navbar/Navbar';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

const WomensFashion = () => {
    const navigate = useNavigate();
    // no longer using URL search; listen to header events instead
    const [womensClothingProducts, setWomensClothingProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [productsPerPage] = useState(4);
    const [selectedPriceRange, setSelectedPriceRange] = useState('All Prices');
    const [sortOrder, setSortOrder] = useState('Newest Arrivals');
    const [cart, setCart] = useState({});
    const [wishlist, setWishlist] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Load persisted cart from localStorage immediately so counters persist on reload
    useEffect(() => {
        try {
            const stored = localStorage.getItem('cart');
            if (stored) {
                setCart(JSON.parse(stored));
            }
        } catch {
            // ignore localStorage errors
        }
    }, []);

    // Fetch products and user content on initial load
    useEffect(() => {
        const fetchProductsAndUserContent = async () => {
            const token = Cookies.get('jwttoken');
            try {
                const productResponse = await axios.get('http://localhost:8000/products/get',{ headers: { Authorization: `Bearer ${token}` } });
                const products = productResponse.data.products.filter(
                    (product) => product.category === "women's clothing"
                );
                setWomensClothingProducts(products);

                if (token) {
                    const [cartResponse, wishlistResponse] = await Promise.all([
                        axios.get('http://localhost:8000/cart', { headers: { Authorization: `Bearer ${token}` } }),
                        axios.get('http://localhost:8000/wishlist/get', { headers: { Authorization: `Bearer ${token}` } }),
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
                    cartItems.forEach(item => {
                        const pid = item.productId && (item.productId._id || item.productId);
                        if (pid) cartObject[String(pid)] = item.quantity || 0;
                    });
                    setCart(cartObject);
                    try {
                        localStorage.setItem('cart', JSON.stringify(cartObject));
                    } catch {
                        // ignore localStorage errors
                    }
                    setWishlist(wishlistResponse.data.wishlist || []);
                }
            } catch (err) {
                setError('Failed to fetch data. Please try again later.');
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProductsAndUserContent();
    }, []);

    // listen for site-search events from header
    useEffect(() => {
        const handler = (e) => {
            const q = (e?.detail?.query || '').trim();
            setSearchQuery(q);
            setCurrentPage(1);
        };
        window.addEventListener('site-search', handler);
        return () => window.removeEventListener('site-search', handler);
    }, []);

    // Combined effect for all filtering, sorting, and searching
    useEffect(() => {
        let newFilteredProducts = [...womensClothingProducts];
        
        // 1. Apply search filter
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            newFilteredProducts = newFilteredProducts.filter(p => {
                const title = (p.title || '').toLowerCase();
                const desc = (p.description || '').toLowerCase();
                return title.includes(q) || desc.includes(q);
            });
        }

        // 2. Apply price range filter
        if (selectedPriceRange !== 'All Prices') {
            const [minPrice, maxPrice] = selectedPriceRange.split('-').map(Number);
            newFilteredProducts = newFilteredProducts.filter(
                (product) => product.price >= minPrice && product.price <= maxPrice
            );
        }

        // 3. Apply sort order
        if (sortOrder === 'Low to High') {
            newFilteredProducts.sort((a, b) => a.price - b.price);
        } else if (sortOrder === 'High to Low') {
            newFilteredProducts.sort((a, b) => b.price - a.price);
        }

        // 4. Update state and reset page
        setFilteredProducts(newFilteredProducts);
        setCurrentPage(1);
    }, [womensClothingProducts, selectedPriceRange, sortOrder, searchQuery]);

    const handleAddToCart = async (product) => {
        const token = Cookies.get('jwttoken');
        if (!token) {
            alert("Please log in to add items to your cart.");
            return;
        }
        const productId = String(product._id);
        const existingQuantity = cart[productId] || 0;
        setCart(prevCart => ({ ...prevCart, [productId]: existingQuantity + 1 }));
        try {
            await axios.post('http://localhost:8000/cart/add', { productId, quantity: existingQuantity + 1 }, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (err) {
            console.error('Failed to add to cart (server)', err);
            setCart(prevCart => ({ ...prevCart, [productId]: existingQuantity }));
            alert("Failed to add item to cart. Please try again.");
        }
    };

    const handleRemoveFromCart = async (productId) => {
        const token = Cookies.get('jwttoken');
        if (!token) return;
        const existingQuantity = cart[productId] || 0;
        const newQuantity = existingQuantity - 1;
        setCart(prevCart => {
            const nextCart = { ...prevCart };
            if (newQuantity > 0) {
                nextCart[productId] = newQuantity;
            } else {
                delete nextCart[productId];
            }
            return nextCart;
        });
        try {
            if (newQuantity > 0) {
                await axios.put('http://localhost:8000/cart/item', { productId, quantity: newQuantity }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.delete('http://localhost:8000/cart/item', {
                    headers: { Authorization: `Bearer ${token}` },
                    data: { productId }
                });
            }
        } catch (err) {
            console.error('Failed to remove cart item (server)', err);
            setCart(cart);
            alert("Failed to update cart. Please try again.");
        }
    };

    const handleAddToWishlist = async (product) => {
        const token = Cookies.get('jwttoken');
        if (!token) {
            alert("Please log in to add items to your wishlist.");
            return;
        }
        const productId = String(product._id);
        const isAlreadyInWishlist = wishlist.some(item => String(item.productId) === productId);
        if (isAlreadyInWishlist) {
            alert("This item is already in your wishlist!");
            return;
        }
        setWishlist(prevWishlist => [...prevWishlist, { productId: productId, product }]);
        try {
            await axios.post('http://localhost:8000/wishlist/add', { productId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (err) {
            console.error('Failed to add to wishlist (server)', err);
            setWishlist(prevWishlist => prevWishlist.filter(item => String(item.productId) !== productId));
            alert("Failed to add to wishlist. Please try again.");
        }
    };

    const handleRemoveFromWishlist = async (productId) => {
        const token = Cookies.get('jwttoken');
        if (!token) return;
        setWishlist(prevWishlist => prevWishlist.filter(item => String(item.productId) !== productId));
        try {
            await axios.delete('http://localhost:8000/wishlist/remove', {
                headers: { Authorization: `Bearer ${token}` },
                data: { productId }
            });
        } catch (err) {
            console.error('Failed to remove from wishlist (server)', err);
            alert("Failed to remove from wishlist. Please try again.");
        }
    };

    const isProductInWishlist = (productId) => wishlist.some(item => String(item.productId) === String(productId));

    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const renderPageNumbers = () => {
        const pageNumbers = [];
        for (let i = 1; i <= totalPages; i++) {
            pageNumbers.push(
                <span
                    key={i}
                    className={`page-number ${i === currentPage ? 'active' : ''}`}
                    onClick={() => paginate(i)}
                >
                    {i}
                </span>
            );
        }
        return pageNumbers;
    };

    if (loading) {
        return <div className="loader-container">
      <div className="loader"></div>
      <p>Loading...</p>
    </div>
    }

    if (error) {
        return <div className="error">{error}</div>;
    }
    

    return (
        <div className="product-page">
            <Navbar/>
            <div className="main-content">
                {/* <button className='back-btn' onClick={() => navigate('/homepage')}><a href='#categories-id' style={{textDecoration:"none",color:"white"}}>Back</a></button> */}
                <div>
                <button onClick={()=>navigate('/homepage')} style={{color:'white',backgroundColor:"purple",padding:"10px",borderRadius:"5px",borderWidth:"0px",cursor:"pointer",height:"40px",width:"70px"}}>Back</button>
                <aside className="filters-sidebar">
                    <h2>Filters</h2>
                    <div className="filter-group">
                        <label htmlFor="price">Price Range</label>
                        <select id="price" value={selectedPriceRange} onChange={(e) => setSelectedPriceRange(e.target.value)}>
                            <option>All Prices</option>
                            <option value="0-100">0 - ₹100</option>
                            <option value="101-500">₹101 - ₹500</option>
                            <option value="501-1000">₹501 - ₹1000</option>
                            <option value="1001-999999">Over ₹1000</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label htmlFor="sort">Sort by:</label>
                        <select id="sort" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                            <option value="Newest Arrivals">Newest Arrivals</option>
                            <option value="Low to High">Price: Low to High</option>
                            <option value="High to Low">Price: High to Low</option>
                        </select>
                    </div>
                </aside>
                </div>
                <main className="product-listing">
                    <div className="listing-header">
                        <h1 className="category-title">Women's Clothing</h1>
                    </div>
                    <div className="product-grid">
                        {currentProducts.length > 0 ? (
                            currentProducts.map((product) => (
                                <div className="product-card" key={product._id}>
                                    <button
                                        className={`wishlist-icon ${isProductInWishlist(product._id) ? 'added' : ''}`}
                                        onClick={() => isProductInWishlist(product._id) ? handleRemoveFromWishlist(product._id) : handleAddToWishlist(product)}
                                    >
                                        {isProductInWishlist(product._id) ? '❤️' : '🤍'}
                                    </button>
                                    <img src={product.image} alt={product.title} className="product-image-large" />
                                    <h3 className="product-title">{product.title}</h3>
                                    <p className="product-price">₹{product.price}</p>
                                    <div className="product-actions">
                                        {cart[String(product._id)] ? (
                                            <div className="cart-counter">
                                                <button onClick={() => handleRemoveFromCart(product._id)}>-</button>
                                                <span>{cart[String(product._id)]}</span>
                                                <button onClick={() => handleAddToCart(product)}>+</button>
                                            </div>
                                        ) : (
                                            <button className="add-to-cart-btn" onClick={() => handleAddToCart(product)}>
                                                Add to Cart
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-products-container">
                <img
                    src="https://cdn-icons-png.flaticon.com/512/4076/4076439.png" // you can replace with your own image
                    alt="No products"
                    className="no-products-image"
                />
                <h2 className="no-products-text">No Products Available</h2>
                <p className="no-products-subtext">
                    Please check back later or adjust your filters.
                </p>
                </div>
                        )}
                    </div>
                    <div className="pagination">
                        <span
                            className={`page-arrow ${currentPage === 1 ? 'disabled' : ''}`}
                            onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                        >
                            &lt;
                        </span>
                        {renderPageNumbers()}
                        <span
                            className={`page-arrow ${currentPage === totalPages ? 'disabled' : ''}`}
                            onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
                        >
                            &gt;
                        </span>
                    </div>
                </main>
            </div>
            <footer className="footer">
                <p>© 2024 Tech Emporium. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default WomensFashion;