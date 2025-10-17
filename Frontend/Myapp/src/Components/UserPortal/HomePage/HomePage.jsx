// src/Components/HomePage/HomePage.jsx
import React from "react";
import "./HomePage.css";
import { useNavigate } from "react-router-dom";

const categories = [
  {
    name: `Men's Fashion`,
    image:
      "https://t3.ftcdn.net/jpg/03/34/79/68/360_F_334796865_VVTjg49nbLgQPG6rgKDjVqSb5XUhBVsW.jpg",
  },
  {
    name: `Women's Fashion`,
    image:
      "https://media.gettyimages.com/id/155596905/photo/high-class-female-clothing.jpg?s=612x612&w=gi&k=20&c=KLbDZP59SwdV8H1DI1NPivMtYvnNxV6zsljjXagBUVg=",
  },
  {
    name: "Electronics",
    image:
      "https://e7.pngegg.com/pngimages/791/606/png-clipart-home-appliance-technique-for-you-washing-machines-clothes-dryer-others-miscellaneous-electronics.png",
  },
  {
    name: "Accessories",
    image:
      "https://static.vecteezy.com/system/resources/thumbnails/007/974/855/small_2x/top-view-travel-accessories-with-shoes-map-smartphone-with-mockup-screen-hat-tourist-essentials-photo.jpg",
  },
];

const featuredProducts = [
  {
    name: "Wireless Headphones",
    description: "Experience immersive sound",
    image:
      "https://shop.zebronics.com/cdn/shop/files/Zeb-Thunderpro-blue-pic-1.jpg?v=1709202990&width=1200",
  },
  {
    name: "Smart Watch",
    description: "Stay connected on the go",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPip9Q5wUYZwjCFVLR39r5uoXbJnaIAaJoCg&s",
  },
  {
    name: "Leather Handbag",
    description: "Elegant and spacious",
    image:
      "https://media.istockphoto.com/id/1302787124/photo/beige-leather-women-handbag-isolated-on-white-background.jpg?s=612x612&w=0&k=20&c=fOO0zCBqF3rbiGLLHwgtOMHxt66adpKikE7Fs2C_fDs=",
  },
];
 const features = [
    {
      id: 1,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
      ),
      iconBg: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
      title: 'Premium Quality',
      description: 'Handpicked dresses crafted by master artisans with finest fabrics'
    },
    {
      id: 2,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      ),
      iconBg: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
      title: 'Personalized Service',
      description: 'One-on-one consultation to find your perfect dress'
    },
    {
      id: 3,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
          <path d="M9.17 8.83L7.76 7.41 4.59 10.59 6 12l3.17-3.17zM14.83 8.83L16.24 7.41 19.41 10.59 18 12l-3.17-3.17z"/>
        </svg>
      ),
      iconBg: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
      title: 'Exclusive Designs',
      description: 'Unique bridal collections you won\'t find anywhere else'
    }
  ];

const testimonials = [
  {
    name: "Sarah M.",
    text: "I love the quality and style of these products. The delivery was fast and the customer service was excellent.",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSg4wgcKE1VD6Fjdzl2wkeY3lyijIo4_lOc7w&s",
  },
  {
    name: "David L.",
    text: "Great selection of products and the company is very professional. I'm very happy with my purchase.",
    image:
      "https://www.bbva.com/wp-content/uploads/2017/03/David-Puente-Global-Head-of-Retail-Client-Solutions.jpg",
  },
  {
    name: "Emily R.",
    text: "The fashion items are trendy and affordable. I always find something I love on this site.",
    image:
      "https://www.investcorp.com/wp-content/uploads/2019/11/Mason_Emily-0001.jpg",
  },
];

const address = "Shop no 337, 338, Pvt Market, Dilsukhnagar";
const contactNo = "7675904571";
const mapsEmbedUrl =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3807.928254735459!2d78.53851759999999!3d17.367185!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb98e959015689%3A0xfe758eee6bc055ac!2sPvt%20market%20kothapet%20dilsukhnagar%20Hyderabad%20500035!5e0!3m2!1sen!2sin!4v1759999191745!5m2!1sen!2sin";

const HomePage = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (categoryName) => {
    window.scrollTo(0, 0);
    const routes = {
      "Electronics": "/userproducts",
      "Men's Fashion": "/mensfashion",
      "Accessories": "/accessories",
      "Women's Fashion": "/womensfashion",
    };
    if (routes[categoryName]) {
      navigate(routes[categoryName]);
    }
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <section className="elegance-hero-section">
      <div className="elegance-hero-container">
        
        {/* Left Content Section */}
        <div className="elegance-content">
          {/* Badge */}
          <div className="collection-badge">
            <svg 
              className="badge-icon" 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="currentColor"
            >
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
            <span className="badge-text">New Collection 2024</span>
          </div>

          {/* Main Heading */}
          <h1 className="elegance-heading">
            Elegance<br />
            <span className="elegance-heading-accent">Redefined</span>
          </h1>

          {/* Description */}
          <p className="elegance-description">
            Discover exquisite dreeses that blend traditional craftsmanship with contemporary style.
            <br/>
          </p>

          {/* CTA Button */}
          <button className="shop-now-btn1">
            <a onClick={() => window.scrollTo(0, document.getElementById("categories-id").offsetTop)}>
              <span>Shop Now</span>
            </a>
            <svg
              className="btn-arrow"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor" 
              strokeWidth="2"
            >
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>

        {/* Right Image Section */}
        <div className="elegance-image-wrapper">
         
          {/* Saree Image */}
          <div className="saree-image-container">
            <img 
              src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&h=1000&fit=crop" 
              alt="Elegant Purple Saree with Gold Border" 
              className="saree-image"
            />
            <div className="image-overlay"></div>
          </div>
        </div>

      </div>
    </section>
      </section>

      {/* Categories Section */}
      <section className="categories-section" id="categories-id">
        <h2>Categories</h2>
        <div className="categories-grid">
          {categories.map((cat, index) => (
            <div
              key={index}
              className="category-item"
              onClick={() => handleCategoryClick(cat.name)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCategoryClick(cat.name);
                }
              }}
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="category-image"
               
              />
              <p className="catgeory-name">{cat.name}</p>
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
              <img
                src={product.image}
                alt={product.name}
                className="product-image"
              />
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
          <p>
            Don't miss our biggest flash sale of the season. Shop now and save
            on your favorite items.
          </p>

          <button className="shop-now-btn">
            <a onClick={() => window.scrollTo(0, document.getElementById("categories-id").offsetTop)}>  
              Shop Now
            </a>
          </button>
        </div>
        <div className="deal-image">
          <img
            src="https://res.cloudinary.com/sricharan/image/upload/v1758774697/Screenshot_2025-09-25_100012_r82hhd.png"
            alt="Limited Time Deal"
          />
        </div>
      </section>
       <section className="why-brides-section">
      <div className="why-brides-container">
        {/* Header */}
        <div className="why-brides-header">
          <h2 className="why-brides-title">Why Brides Choose Us</h2>
          <p className="why-brides-subtitle">
            We're committed to making your wedding day absolutely perfect
          </p>
        </div>

        {/* Features Grid */}
        <div className="features-grid">
          {features.map((feature) => (
            <div key={feature.id} className="feature-card">
              <div 
                className="feature-icon-wrapper"
                style={{ background: feature.iconBg }}
              >
                <div className="feature-icon">
                  {feature.icon}
                </div>
              </div>
              
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

      {/* Customer Testimonials Section */}
      <section className="testimonials-section">
        <h2>Customer Testimonials</h2>
        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-card">
              <img
                src={testimonial.image}
                alt={testimonial.name}
                className="customer-avatar"
              />
              <p>{testimonial.text}</p>
              <h4>{testimonial.name}</h4>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <div className="contact-container">
        <div className="contact-map">
          <iframe
            title="Google Map Location"
            src={mapsEmbedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>

        <div className="contact-details">
          <h2 className="details-title">Visit Our Location</h2>
          <div className="detail-item">
            <i className="fas fa-map-marker-alt"></i>
            <p className="detail-text">
              Address:
              <br />
              <span className="address-link">{address}</span>
            </p>
          </div>
          <div className="detail-item">
            <i className="fas fa-phone"></i>
            <p className="detail-text">
              Call Us:
              <br />
              <a href={`tel:${contactNo}`} className="phone-link">
                {contactNo}
              </a>
            </p>
          </div>
        </div>
      </div>

    
    </div>
  );
};

export default HomePage;