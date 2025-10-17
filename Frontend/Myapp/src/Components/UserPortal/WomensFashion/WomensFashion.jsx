import React, { useState, useEffect } from 'react';
import './WomensFashion.css';
import Navbar from '../../Navbar/Navbar';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart as addToCartAction, decrementQuantity, removeFromCart as removeFromCartAction } from '../../../Slice';

const WomensFashion = () => {
    const navigate = useNavigate();
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
    const dispatch = useDispatch();

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
                const productResponse = await axios.get(
                    `${import.meta.env.VITE_API_URL}/products/get`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const products = productResponse.data.products.filter(
                    (product) => product.category === "women's clothing"
                );
                setWomensClothingProducts(products);

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
            newFilteredProducts = newFilteredProducts.filter((p) => {
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

    const handleAddToCart = async (product, e) => {
        e.stopPropagation();
        const token = Cookies.get('jwttoken');
        if (!token) {
            alert('Please log in to add items to your cart.');
            return;
        }
        const productId = String(product._id);
        const existingQuantity = cart[productId] || 0;
        setCart((prevCart) => ({ ...prevCart, [productId]: existingQuantity + 1 }));
        try {
            dispatch(addToCartAction({ productId }));
        } catch (e) {
            console.debug('optimistic add failed', e);
        }
        try {
            await axios.post(
                `${import.meta.env.VITE_API_URL}/cart/add`,
                { productId, quantity: existingQuantity + 1 },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            try {
                localStorage.setItem(
                    'cart',
                    JSON.stringify({ ...cart, [productId]: existingQuantity + 1 })
                );
            } catch {
                // ignore localStorage errors
            }
        } catch (err) {
            console.error('Failed to add to cart (server)', err);
            setCart((prevCart) => ({ ...prevCart, [productId]: existingQuantity }));
            alert('Failed to add item to cart. Please try again.');
        }
    };

    const handleRemoveFromCart = async (productId, e) => {
        e.stopPropagation();
        const token = Cookies.get('jwttoken');
        if (!token) return;
        const existingQuantity = cart[productId] || 0;
        const newQuantity = existingQuantity - 1;
        setCart((prevCart) => {
            const nextCart = { ...prevCart };
            if (newQuantity > 0) {
                nextCart[productId] = newQuantity;
            } else {
                delete nextCart[productId];
            }
            try {
                localStorage.setItem('cart', JSON.stringify(nextCart));
            } catch {
                // ignore localStorage errors
            }
            return nextCart;
        });
        try {
            if (newQuantity > 0) {
                dispatch(decrementQuantity(productId));
            } else {
                dispatch(removeFromCartAction(String(productId)));
            }
        } catch (e) {
            console.debug('optimistic remove failed', e);
        }
        try {
            if (newQuantity > 0) {
                await axios.put(
                    `${import.meta.env.VITE_API_URL}/cart/item`,
                    { productId, quantity: newQuantity },
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
            } else {
                await axios.delete(`${import.meta.env.VITE_API_URL}/cart/item`, {
                    headers: { Authorization: `Bearer ${token}` },
                    data: { productId },
                });
            }
        } catch (err) {
            console.error('Failed to remove cart item (server)', err);
            setCart(cart);
            alert('Failed to update cart. Please try again.');
        }
    };

    const handleAddToWishlist = async (product, e) => {
        e.stopPropagation();
        const token = Cookies.get('jwttoken');
        if (!token) {
            alert('Please log in to add items to your wishlist.');
            return;
        }
        const productId = String(product._id);
        const isAlreadyInWishlist = wishlist.some(
            (item) => String(item.productId) === productId
        );
        if (isAlreadyInWishlist) {
            alert('This item is already in your wishlist!');
            return;
        }
        setWishlist((prevWishlist) => [
            ...prevWishlist,
            { productId: productId, product },
        ]);
        try {
            await axios.post(
                `${import.meta.env.VITE_API_URL}/wishlist/add`,
                { productId },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
        } catch (err) {
            console.error('Failed to add to wishlist (server)', err);
            setWishlist((prevWishlist) =>
                prevWishlist.filter((item) => String(item.productId) !== productId)
            );
            alert('Failed to add to wishlist. Please try again.');
        }
    };

    const handleRemoveFromWishlist = async (productId, e) => {
        e.stopPropagation();
        const token = Cookies.get('jwttoken');
        if (!token) return;
        setWishlist((prevWishlist) =>
            prevWishlist.filter((item) => String(item.productId) !== productId)
        );
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/wishlist/remove`, {
                headers: { Authorization: `Bearer ${token}` },
                data: { productId },
            });
        } catch (err) {
            console.error('Failed to remove from wishlist (server)', err);
            alert('Failed to remove from wishlist. Please try again.');
        }
    };

    const handleProductClick = (productId) => {
        navigate(`/product/${productId}`);
    };

    const isProductInWishlist = (productId) =>
        wishlist.some((item) => String(item.productId) === String(productId));

    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(
        indexOfFirstProduct,
        indexOfLastProduct
    );
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

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
        return (
            <div className="loader-container">
                <div className="loader"></div>
                <p>Loading...</p>
            </div>
        );
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="product-page">
            <Navbar />

            <div className="main-content">
                <div className="">
                    <button
                        onClick={() => navigate('/homepage')}
                        style={{
                            color: 'white',
                            backgroundColor: 'purple',
                            padding: '10px',
                            borderRadius: '5px',
                            borderWidth: '0px',
                            cursor: 'pointer',
                            height: '40px',
                            width: '70px',
                        }}
                    >
                        Back
                    </button>
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
                        <h1 className="category-title">Women's Fashion</h1>
                    </div>
                    <div className="product-grid-new">
                        {filteredProducts.length === 0 ? (
                            <div className="no-products-container">
                                <img
                                    src="https://cdn-icons-png.flaticon.com/512/4076/4076439.png"
                                    alt="No products"
                                    className="no-products-image"
                                />
                                <h2 className="no-products-text">No Products Available</h2>
                                <p className="no-products-subtext">
                                    Please check back later or adjust your filters.
                                </p>
                            </div>
                        ) : (
                            currentProducts.map((product) => (
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
                                                isProductInWishlist(product._id) ? 'active' : ''
                                            }`}
                                            onClick={(e) =>
                                                isProductInWishlist(product._id)
                                                    ? handleRemoveFromWishlist(product._id, e)
                                                    : handleAddToWishlist(product, e)
                                            }
                                        >
                                            {isProductInWishlist(product._id) ? '❤️' : '🤍'}
                                        </button>
                                    </div>
                                    <div className="product-info-section">
                                        <div className="product-category-badge">
                                            {product.category || 'Fashion'}
                                        </div>
                                        <h3 className="product-title-new">{product.title}</h3>
                                        
                                        <div className="product-bottom-section">
                                            <div className="price-stock-section">
                                                <span className="product-price-new">
                                                    ₹{product.price}
                                                </span>
                                            </div>
                                            <div className="product-actions-section">
                                                {cart[String(product._id)] ? (
                                                    <div className="cart-quantity-control">
                                                        <button
                                                            className="minus quantity-btn"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRemoveFromCart(
                                                                    product._id,
                                                                    e
                                                                );
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
                                                                handleAddToCart(product, e);
                                                            }}
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        className="add-cart-button-new"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleAddToCart(product, e);
                                                        }}
                                                    >
                                                        Add to Cart
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    {filteredProducts.length > 0 && (
                        <div className="pagination">
                            <span
                                className={`page-arrow ${currentPage === 1 ? 'disabled' : ''}`}
                                onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                            >
                                &lt;
                            </span>
                            {renderPageNumbers()}
                            <span
                                className={`page-arrow ${
                                    currentPage === totalPages ? 'disabled' : ''
                                }`}
                                onClick={() =>
                                    currentPage < totalPages && paginate(currentPage + 1)
                                }
                            >
                                &gt;
                            </span>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default WomensFashion;