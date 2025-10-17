import React, { useState, useEffect, useRef } from 'react';
import './EditProduct.css';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';

const EditProduct = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  
  const productToEdit = location.state?.product;

  
  const [title, setTitle] = useState(productToEdit?.title || '');
  const [description, setDescription] = useState(productToEdit?.description || '');
  const [price, setPrice] = useState(productToEdit?.price || '');
  const [category, setCategory] = useState(productToEdit?.category || '');
  const [count, setCount] = useState(productToEdit?.count || '');
  const [image, setImage] = useState(productToEdit?.image || '');
  const [status, setStatus] = useState('');

  const token = Cookies.get('jwttoken');

  // Redirect if no product data
  useEffect(() => {
    if (!productToEdit) {
      navigate('/admin/products');
    }
  }, [productToEdit, navigate]);

  // 🔧 Cloudinary Config
  const CLOUD_NAME = "sricharan";  
  const UPLOAD_PRESET = "ml_default";

  // Upload image to Cloudinary
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

  // Handle file selection
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

  // Handle drag & drop
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

  // Update product
  const handleUpdate = async (e) => {
    e.preventDefault();
    setStatus('');

    if (!productToEdit) {
      setStatus("Error: No product data found for editing.");
      return;
    }

    if (!title || !description || !price || !category || !count || !image) {
      setStatus("Please fill in all fields and upload an image.");
      return;
    }

    const updatedData = {
      title,
      description,
      price: Number(price),
      category,
      count: Number(count),
      image, // ✅ Cloudinary URL
    };

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/products/${productToEdit.id}`,
        updatedData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setStatus("Product updated successfully!");
      console.log('Product updated:', response.data.product);

      setTimeout(() => {
        navigate('/admin/products');
      }, 2000);
    } catch (error) {
      console.error('Error updating product:', error);
      setStatus(
        `Error: ${error.response?.data?.message || 'Could not update product.'}`
      );
    }
  };

  const handleCancel = () => {
    navigate('/admin/products');
  };

  return (
    <div className="admin-page">
      <div className="content-wrapper" style={{ marginTop: "40px" }}>
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
            left: "-400px",
            bottom: "-20px"
          }}
        >
          Back
        </button>

        <div className="edit-card" style={{ position: "relative", bottom: "60px" }}>
          <h2 className="card-title">Edit Product</h2>
          <form onSubmit={handleUpdate}>
            <div className="form-grid">
              <div className="form-group full-width">
                <label htmlFor="title">Product Name</label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="form-group full-width">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="form-group price-group">
                <label htmlFor="price">Price</label>
                <input
                  type="number"
                  id="price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
              <div className="form-group category-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="electronics">electronics</option>
                  <option value="men's clothing">Men's Clothing</option>
                  <option value="women's clothing">Women's Clothing</option>
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
                />
              </div>
              <div className="form-group full-width">
                <label>Product Image</label>
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
              </div>
            </div>

            {status && <p className="status-message">{status}</p>}

            <div className="button-group">
              <button
                type="button"
                className="btn cancel-btn"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button type="submit" className="btn updated-btn">
                Update Product
              </button>
            </div>
          </form>
        </div>
      </div>

     
    </div>
  );
};

export default EditProduct;
