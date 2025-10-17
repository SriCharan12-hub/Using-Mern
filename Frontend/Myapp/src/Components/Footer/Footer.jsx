import React from 'react';
import { Facebook, Twitter, Instagram, Mail } from 'lucide-react';

const styles = `
  /* Footer Container */
  .footer {
    background-color: #0f172e;
    color: #e0e7ff;
    padding: 40px 20px 20px 20px;
    margin-top: 60px;
  }

  .footer-container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .footer-content {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 40px;
    margin-bottom: 40px;
  }

  /* Footer Sections */
  .footer-section {
    display: flex;
    flex-direction: column;
  }

  /* Company Header */
  .company-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 15px;
  }

  .vitara-logo {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 24px;
    color: white;
  }

  .company-name {
    font-size: 24px;
    font-weight: 700;
    margin: 0;
    color: #ffffff;
  }

  .company-description {
    font-size: 14px;
    line-height: 1.6;
    color: #a5b4fc;
    margin: 15px 0 20px 0;
  }

  /* Social Links */
  .social-links {
    display: flex;
    gap: 15px;
  }

  .social-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    color: #e0e7ff;
    transition: all 0.3s ease;
    text-decoration: none;
    border: 1px solid transparent;
  }

  .social-icon:hover {
    background-color: #4f46e5;
    color: #ffffff;
    transform: translateY(-3px);
  }

  /* Section Titles */
  .section-title {
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 20px 0;
    color: #ffffff;
    text-transform: capitalize;
  }

  /* Footer Links */
  .footer-links {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .footer-links li a {
    color: #a5b4fc;
    text-decoration: none;
    font-size: 14px;
    transition: all 0.3s ease;
    display: inline-block;
  }

  .footer-links li a:hover {
    color: #ffffff;
    transform: translateX(4px);
  }

  /* Footer Bottom */
  .footer-bottom {
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding-top: 20px;
    text-align: center;
    color: #6b7280;
    font-size: 13px;
  }

  /* Responsive Design */
  /* Tablet (768px and below) */
  @media (max-width: 768px) {
    .footer {
      padding: 30px 15px 15px 15px;
      margin-top: 40px;
    }

    .footer-content {
      grid-template-columns: repeat(2, 1fr);
      gap: 30px;
    }
  }

  /* Mobile (480px and below) */
  @media (max-width: 480px) {
    .footer {
      padding: 25px 15px 15px 15px;
      margin-top: 30px;
    }

    .footer-content {
      grid-template-columns: 1fr;
      gap: 25px;
    }

    .company-header {
      margin-bottom: 12px;
    }

    .section-title {
      font-size: 15px;
      margin-bottom: 15px;
    }

    .footer-links {
      gap: 10px;
    }

    .footer-links li a {
      font-size: 13px;
    }

    .company-description {
      font-size: 13px;
      margin: 12px 0 15px 0;
    }

    .social-links {
      gap: 12px;
    }

    .social-icon {
      width: 36px;
      height: 36px;
    }

    .vitara-logo {
      width: 36px;
      height: 36px;
      font-size: 20px;
    }

    .company-name {
      font-size: 20px;
    }

    .footer-bottom {
      font-size: 12px;
      padding-top: 15px;
    }
  }
`;

export default function Footer() {
  return (
    <>
      <style>{styles}</style>
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-content">
            {/* Company Info Section */}
            <div className="footer-section">
              <div className="company-header">
                <div className="vitara-logo">T</div>
                <h2 className="company-name">Trendify</h2>
              </div>
              <p className="company-description">
                Your trusted e-commerce platform for quality products and exceptional service.
              </p>
              <div className="social-links">
                <a  className="social-icon" aria-label="Facebook">
                  <Facebook size={20} />
                </a>
                <a  className="social-icon" aria-label="Twitter">
                  <Twitter size={20} />
                </a>
                <a href="https://www.instagram.com/wildcharan/?__pwa=1" className="social-icon" aria-label="Instagram">
                  <Instagram size={20} />
                </a>
                <a  className="social-icon" aria-label="Email">
                  <Mail size={20} />
                </a>
              </div>
            </div>

            {/* Company Links */}
            <div className="footer-section">
              <h3 className="section-title">Company</h3>
              <ul className="footer-links">
                <li><a >About Us</a></li>
                <li><a >Careers</a></li>
                <li><a >Press</a></li>
              </ul>
            </div>

            {/* Support Links */}
            <div className="footer-section">
              <h3 className="section-title">Support</h3>
              <ul className="footer-links">
                <li><a >Help Center</a></li>
                <li><a >Contact Us</a></li>
                <li><a >Returns</a></li>
              </ul>
            </div>

            {/* Legal Links */}
            <div className="footer-section">
              <h3 className="section-title">Legal</h3>
              <ul className="footer-links">
                <li><a >Privacy Policy</a></li>
                <li><a >Terms of Service</a></li>
                <li><a >Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="footer-bottom">
            <p>&copy; 2024 Vitara. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}