import React, { useState, useRef } from 'react';
import axios from 'axios';
import './AddProduct.css';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const AddNewProduct = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState("men's clothing");
  const [count, setCount] = useState('');
  const [image, setImage] = useState('');
  const [status, setStatus] = useState('');

  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const token = Cookies.get('jwttoken');

  // 🔧 Cloudinary Config
  const CLOUD_NAME = "sricharan";       
  const UPLOAD_PRESET = "ml_default"; 

  // Function to upload to Cloudinary
  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    try {
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (p) => {
            const percent = Math.round((p.loaded * 100) / p.total);
            setStatus(`Uploading: ${percent}%`);
          },
        }
      );
      return res.data.secure_url; // Cloudinary URL
    } catch (err) {
      console.error("Cloudinary Upload Error:", err);
      setStatus("Image upload failed!");
      return null;
    }
  };

  // Handle file selection (click upload)
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setStatus("Uploading image...");
      const uploadedUrl = await uploadToCloudinary(file);
      if (uploadedUrl) {
        setImage(uploadedUrl);
        setStatus("Image uploaded successfully!");
      }
    }
  };

  // Handle drag & drop upload
  const handleImageDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setStatus("Uploading image...");
      const uploadedUrl = await uploadToCloudinary(file);
      if (uploadedUrl) {
        setImage(uploadedUrl);
        setStatus("Image uploaded successfully!");
      }
    }
  };

  // Save product to backend
  const handleSave = async (e) => {
    e.preventDefault();
    setStatus('');

    try {
      if (!title || !description || !price || !category || !count || !image) {
        setStatus('Please fill in all the details and upload an image.');
        return;
      }

      const productData = {
        title,
        price: Number(price),
        category,
        image, // ✅ Cloudinary URL
        count: Number(count),
        description,
      };

      const response = await axios.post(
        'http://localhost:8000/products/add',
        productData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Product saved successfully!', response.data);
      setStatus('Product added successfully!');

      // Reset form
      setTitle('');
      setDescription('');
      setPrice('');
      setCategory("men's clothing");
      setCount('');
      setImage('');
    } catch (error) {
      console.error('Error saving product:', error);
      setStatus(
        `Error: ${error.response?.data?.message || 'Could not connect to server.'}`
      );
    }
  };

  const handleCancel = () => {
    setStatus('Operation cancelled.');
    setTitle('');
    setDescription('');
    setPrice('');
    setCategory("men's clothing");
    setCount('');
    setImage('');
  };

  return (
    <div className="admin-page">
      <div className="content-wrapper" style={{ marginTop: "80px" }}>
        <button
          onClick={(e) => {
            e.preventDefault();
            navigate('/admin/products');
          }}
          style={{
            color: 'white',
            backgroundColor: "purple",
            padding: "10px",
            borderRadius: "5px",
            borderWidth: "0px",
            cursor: "pointer",
            height: "40px",
            width: "70px",
            position: "relative",
            left: "-530px",
            bottom: "30px"
          }}
        >
          Back
        </button>

        <div className="add-product-container" style={{ position: "relative", bottom: "95px" }}>
          <div
            className="image-upload-area"
            onDrop={handleImageDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current.click()}
          >
            {image ? (
              <img src={image} alt="Uploaded" className="uploaded-image" />
            ) : (
              <>
                <svg
                  className="cloud-icon"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M16 16.18C18.66 15.34 20 13.59 20 10.5C20 7.87 18.28 5.76 16.03 5.48C15.46 3.03 13.12 1.5 10.5 2C8.36 2.45 6.74 4.09 6.28 6.2C4.12 6.55 2.5 8.16 2.5 10.5C2.5 12.83 4.12 14.44 6.28 14.79C6.84 17.18 9.07 19.5 12 19.5C14.73 19.5 16.45 17.15 16 16.18Z"
                    fill="#999"
                  />
                </svg>
                <p>Drag & Drop or click to upload</p>
                <p className="file-info">PNG, JPG, GIF up to 10MB</p>
              </>
            )}

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
          </div>

          <div className="product-details-form">
            <div className="form-header">
              <h2>Add New Product</h2>
              <p>Fill in the details below to add a new product to the catalog.</p>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="title">Product Name</label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Product Name"
                  />
                </div>
                <div className="form-group full-width">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the product..."
                  />
                </div>
                <div className="form-group price-group">
                  <label htmlFor="price">Price</label>
                  <input
                    type="number"
                    id="price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="₹ 0.00"
                  />
                </div>
                <div className="form-group category-group">
                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="men's clothing">men's clothing</option>
                    <option value="electronics">electronics</option>
                    <option value="women's clothing">women's clothing</option>
                    <option value="Home">Home</option>
                  </select>
                </div>
                <div className="form-group full-width">
                  <label htmlFor="count">Stock Quantity</label>
                  <input
                    type="number"
                    id="count"
                    value={count}
                    onChange={(e) => setCount(e.target.value)}
                    placeholder="e.g. 100"
                  />
                </div>
              </div>
              <div className="status-message">
                {status && <p>{status}</p>}
              </div>
              <div className="button-group">
                <button type="button" className="btn cancel-btn" onClick={handleCancel}>
                  Cancel
                </button>
                <button type="submit" className="btn save-btn">
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <footer className="footer">
        <div className="footer-content">
          <p>©2024 Trendify Admin. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default AddNewProduct;
