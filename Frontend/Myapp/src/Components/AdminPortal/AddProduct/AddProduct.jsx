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
  const [images, setImages] = useState([]); // Changed to array
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
      return res.data.secure_url; 
    } catch (err) {
      console.error("Cloudinary Upload Error:", err);
      setStatus("Image upload failed!");
      return null;
    }
  };

  // Handle multiple file selection
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setStatus("Uploading images...");
    const uploadedUrls = [];

    for (let i = 0; i < files.length; i++) {
      setStatus(`Uploading image ${i + 1} of ${files.length}...`);
      const uploadedUrl = await uploadToCloudinary(files[i]);
      if (uploadedUrl) {
        uploadedUrls.push(uploadedUrl);
      }
    }

    if (uploadedUrls.length > 0) {
      setImages((prev) => [...prev, ...uploadedUrls]);
      setStatus(`${uploadedUrls.length} image(s) uploaded successfully!`);
    }
  };

  // Handle drag & drop upload
  const handleImageDrop = async (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    setStatus("Uploading images...");
    const uploadedUrls = [];

    for (let i = 0; i < files.length; i++) {
      setStatus(`Uploading image ${i + 1} of ${files.length}...`);
      const uploadedUrl = await uploadToCloudinary(files[i]);
      if (uploadedUrl) {
        uploadedUrls.push(uploadedUrl);
      }
    }

    if (uploadedUrls.length > 0) {
      setImages((prev) => [...prev, ...uploadedUrls]);
      setStatus(`${uploadedUrls.length} image(s) uploaded successfully!`);
    }
  };

  // Remove image from array
  const handleRemoveImage = (indexToRemove) => {
    setImages((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  // Save product to backend
  const handleSave = async (e) => {
    e.preventDefault();
    setStatus('');

    try {
      if (!title || !description || !price || !category || !count || images.length === 0) {
        setStatus('Please fill in all the details and upload at least one image.');
        return;
      }

      const productData = {
        title,
        price: Number(price),
        category,
        image: images[0], // First image as main image
        images: images, // All images array
        count: Number(count),
        description,
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/products/add`,
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
      setImages([]);
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
    setImages([]);
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
            bottom: "20px"
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
            style={{ minHeight: images.length > 0 ? "auto" : "300px" }}
          >
            {images.length > 0 ? (
              <div style={{ width: "100%" }}>
                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", 
                  gap: "10px",
                  padding: "10px"
                }}>
                  {images.map((img, index) => (
                    <div key={index} style={{ position: "relative" }}>
                      <img 
                        src={img} 
                        alt={`Upload ${index + 1}`} 
                        style={{ 
                          width: "100%", 
                          height: "120px", 
                          objectFit: "cover",
                          borderRadius: "8px"
                        }} 
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage(index);
                        }}
                        style={{
                          position: "absolute",
                          top: "5px",
                          right: "5px",
                          background: "red",
                          color: "white",
                          border: "none",
                          borderRadius: "50%",
                          width: "25px",
                          height: "25px",
                          cursor: "pointer",
                          fontSize: "14px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        ×
                      </button>
                      {index === 0 && (
                        <span style={{
                          position: "absolute",
                          bottom: "5px",
                          left: "5px",
                          background: "purple",
                          color: "white",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontSize: "11px",
                          fontWeight: "bold"
                        }}>
                          Main
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <p style={{ textAlign: "center", marginTop: "10px", color: "#666" }}>
                  Click or drag to add more images
                </p>
              </div>
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
                <p className="file-info">PNG, JPG, GIF up to 10MB (Multiple images supported)</p>
              </>
            )}

            <input
              type="file"
              accept="image/*"
              multiple
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
      
    </div>
  );
};

export default AddNewProduct;