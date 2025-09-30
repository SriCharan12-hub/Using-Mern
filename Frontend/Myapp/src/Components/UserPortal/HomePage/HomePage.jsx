import React from 'react';
import './HomePage.css';
import { useNavigate } from 'react-router-dom';
// Dummy data for products, categories, and testimonials
const categories = [
    { name: `Men's Fashion`, image: 'https://t3.ftcdn.net/jpg/03/34/79/68/360_F_334796865_VVTjg49nbLgQPG6rgKDjVqSb5XUhBVsW.jpg' },
    { name: `Women's Fashion`, image: 'https://media.gettyimages.com/id/155596905/photo/high-class-female-clothing.jpg?s=612x612&w=gi&k=20&c=KLbDZP59SwdV8H1DI1NPivMtYvnNxV6zsljjXagBUVg=' },
    { name: 'Electronics', image: 'https://e7.pngegg.com/pngimages/791/606/png-clipart-home-appliance-technique-for-you-washing-machines-clothes-dryer-others-miscellaneous-electronics.png' },
    
    { name: 'Accessories', image: 'https://static.vecteezy.com/system/resources/thumbnails/007/974/855/small_2x/top-view-travel-accessories-with-shoes-map-smartphone-with-mockup-screen-hat-tourist-essentials-photo.jpg' },
];

const featuredProducts = [
    { name: 'Wireless Headphones', description: 'Experience immersive sound', image: 'https://shop.zebronics.com/cdn/shop/files/Zeb-Thunderpro-blue-pic-1.jpg?v=1709202990&width=1200' },
    { name: 'Smart Watch', description: 'Stay connected on the go', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPip9Q5wUYZwjCFVLR39r5uoXbJnaIAaJoCg&s' },
    { name: 'Leather Handbag', description: 'Elegant and spacious', image: 'https://media.istockphoto.com/id/1302787124/photo/beige-leather-women-handbag-isolated-on-white-background.jpg?s=612x612&w=0&k=20&c=fOO0zCBqF3rbiGLLHwgtOMHxt66adpKikE7Fs2C_fDs=' },
];

const testimonials = [
    { name: 'Sarah M.', text: 'I love the quality and style of these products. The delivery was fast and the customer service was excellent.', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSg4wgcKE1VD6Fjdzl2wkeY3lyijIo4_lOc7w&s' },
    { name: 'David L.', text: 'Great selection of products and the company is very professional. I\'m very happy with my purchase.', image: 'https://www.bbva.com/wp-content/uploads/2017/03/David-Puente-Global-Head-of-Retail-Client-Solutions.jpg' },
    { name: 'Emily R.', text: 'The fashion items are trendy and affordable. I always find something I love on this site.', image: 'https://www.investcorp.com/wp-content/uploads/2019/11/Mason_Emily-0001.jpg' },
];

const HomePage = () => {
    const navigate = useNavigate();
    return (
        <div className="home-page">

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1>Elevate Your Style</h1>
                    <p>Discover the latest trends in fashion and electronics. Shop now and define your look.</p>
                    <button className="shop-now-btn"><a href='#categories-id' style={{textDecoration:"none", color:"white"}}>Shop Now</a></button>
                </div>
            </section>

            {/* Categories Section */}
            <section className="categories-section" id='categories-id'>
                <h2>Categories</h2>
                <div className="categories-grid">
                    {categories.map((cat, index) => (
                                        <div
                                            key={index}
                                            className="category-item"
                                            onClick={() => {
                                                window.scrollTo(0,0)
                                                if (cat.name === 'Electronics') navigate('/userproducts');
                                                else if (cat.name === `Men's Fashion`) navigate('/mensfashion');
                                                else if (cat.name === 'Accessories') navigate('/accessories');
                                                else if (cat.name === `Women's Fashion`) navigate('/womensfashion');
                                            }}
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(e) => { if (e.key === 'Enter') { if (cat.name === 'Electronics') navigate('/userproducts'); } 
                                            else if (cat.name === `Men's Fashion`) navigate('/mensfashion');
                                            else if (cat.name === 'Accessories') navigate('/accessories');
                                            else if (cat.name === `Women's Fashion`) navigate('/womensfashion');
                                        }}>
                                            <img src={cat.image} alt={cat.name} className="category-image" style={{marginTop:"50px",height:"150px",width:"120px"}} />
                                            <p className='catgeory-name'>{cat.name}</p>
                                        </div>
                                    ))}
                </div>
            </section>

            {/* Featured Products Section */}
            <section className="featured-products-section">
                <h2>Featured Products</h2>
                <div className="products-grid">
                    {featuredProducts.map((product, index) => (
                        <div key={index} className="product-card">
                            <img src={product.image} alt={product.name} className="product-image" />
                            <div className="product-info">
                                <h3>{product.name}</h3>
                                <p>{product.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Limited Time Deals Section */}
            <section className="deals-section">
                <div className="deal-content">
                    <h2>Limited Time Deals</h2>
                    <h3>Flash Sale: up to 50% OFF</h3>
                    <p>Don't miss our biggest flash sale of the season. Shop now and save on your favorite items.</p>


                    <button className="shop-now-btn"><a href="#categories-id" style={{ color: 'inherit', textDecoration: 'none' }}>Shop Now</a></button>
                </div>
                <div className="deal-image">
                    <img src="https://res.cloudinary.com/dedmnd9gb/image/upload/v1758774697/Screenshot_2025-09-25_100012_r82hhd.png" alt="Limited Time Deal" />
                </div>
            </section>

            {/* Customer Testimonials Section */}
            <section className="testimonials-section">
                <h2>Customer Testimonials</h2>
                <div className="testimonials-grid">
                    {testimonials.map((testimonial, index) => (
                        <div key={index} className="testimonial-card">
                            <img src={testimonial.image} alt={testimonial.name} className="customer-avatar" />
                            <p>{testimonial.text}</p>
                            <h4>{testimonial.name}</h4>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="footer-links">
                    <a href="#">About Us</a>
                    <a href="#">Contact</a>
                    <a href="#">Privacy Policy</a>
                    <a href="#">Terms of Service</a>
                </div>
                <div className="social-links">
                    {/* Social media icons */}
                </div>
                <p className="copyright">© 2024 Trendify. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default HomePage;