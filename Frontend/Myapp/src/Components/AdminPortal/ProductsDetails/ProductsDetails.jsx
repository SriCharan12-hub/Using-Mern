import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProductsDetails.css';
import { useNavigate, Link} from 'react-router-dom';

// Ensure this path is correct
import Cookies from 'js-cookie'

const ProductsDetails = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState(''); // State for the search query

    // Fetch product data when the component mounts
    const token = Cookies.get('jwttoken')
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/products/get`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                // Assuming the API response structure is { data: { products: [...] } }
                setProducts(response.data.products);
            } catch (err) {
                console.error("Error fetching products:", err);
                setError("Failed to load products. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Function to handle product deletion
    const handleDelete = async (productId) => {
        if (!window.confirm("Are you sure you want to delete this product?")) {
            return;
        }

        try {
            // Note: Use product.id or product._id based on your MongoDB schema
            const response = await axios.delete(`${import.meta.env.VITE_API_URL}/products/${productId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log(response)

            if (response.status === 200) {
                // Update state: filter out the deleted product using its ID
                setProducts(products.filter(product => (product.id || product._id) !== productId));
                alert(response.data.message || "Product deleted successfully.");
            }
        } catch (error) {
            console.error("Error deleting product:", error);
            alert(`Error: ${error.response?.data?.message || "Could not delete product."}`);
        }
    };

    // Filter products based on the search query
    const filteredProducts = products?.filter(product => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return true; // Show all products if search is empty

        // Check if the product title or category includes the search query
        const titleMatch = product.title?.toLowerCase().includes(query);
        const categoryMatch = product.category?.toLowerCase().includes(query);
        
        return titleMatch || categoryMatch;
    });

    if (loading) {
        return <div className="loader-container">
                <div className="loader"></div>
                <p>Loading...</p>
                </div>
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="dashboard-page">

            <div className="content-wrapper" style={{marginTop:"45px"}}>
                <div className="dashboard-section">
                    <div className="section-header">
                        <h2 className="section-title">Products</h2>
                        <button className="add-product-btn" onClick={(e) => {
                            e.preventDefault();
                            navigate('/admin/add-product')}}>Add Product</button>
                    </div>
                    
                   
                   <div className="search-bar-container">
                    <input
                        type="text"
                        placeholder="Search by product name or category..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                    
                    <button className="search-icon-btn">
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 24 24" 
                            fill="currentColor" 
                            className="search-icon-svg"
                        >
                            <path 
                                fillRule="evenodd" 
                                d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.613 4.613a.75.75 0 1 1-1.06 1.06l-4.613-4.613A8.25 8.25 0 0 1 2.25 10.5Z" 
                                clipRule="evenodd" 
                            />
                        </svg>
                    </button>
                    </div>
                 

                    <div className="table-container">
                        <table className="products-table">
                            <thead>
                                <tr>
                                    <th>PRODUCT NAME</th>
                                    <th>PRICE</th>
                                    <th>STOCK</th>
                                    <th>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Render the FILTERED products list */}
                                {filteredProducts.length > 0 ? (
                                    filteredProducts.map((product) => (
                                        // Use a consistent ID for the key and handleDelete
                                        <tr key={product.id || product._id}> 
                                            <td className="product-cell">
                                                <img src={product.image} alt={product.title} className="product-image" />
                                                {product.title}
                                            </td>
                                            <td>₹{product.price ? product.price.toFixed(2) : 'N/A'}</td>
                                            <td>{product.count || 'N/A'}</td>
                                            <td className="actions-cell">
                                                <a className="action-link edit-link" onClick={(e) => {
                                                    e.preventDefault();
                                                //  console.log("Edit button clicked for product:", product);
                                                    navigate('/admin/edit-product', { state: { product } })
                                                    }} style={{ cursor: "pointer",position:"relative",bottom:"20px" }}>Edit</a>
                                                <a className="action-link delete-link" style={{ cursor: "pointer",position:"relative",bottom:"20px" }} onClick={(e) => {
                                                  e.preventDefault(); 
                                                   handleDelete(product.id || product._id)
                                                    }}>Delete</a>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="no-products-message">No products found matching your search.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

               
            </div>
        </div>
    );
};

export default ProductsDetails;