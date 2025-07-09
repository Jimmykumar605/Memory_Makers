import React from "react";
import { useState } from "react";
import photographer_data from "../../assets/Photographers";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { getSessionData } from "../../Utils/Utils";
import axios from "axios";
import "./PhotographerProfile.css";
function PhotographerProfile() {
  const [user, setUser] = useState({});
  const [sImages, setImages] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Wedding');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchImages = async () => {
    if (!user._id) return;

    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:9000/photographers/${user._id}/images/${selectedCategory}`);
      console.log("response :>> ", response);
      if (response.data.success == true) {
        setImages(response.data.images);
      } else {
        setImages([]);
      }
    } catch (error) {
      setImages([]);
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    try {
      const sessionData = getSessionData("USER_DATA");
      if (sessionData) {
        setUser(sessionData);
      }
    } catch (error) {
      console.log("error :>> ", error);
    }
  }, []);

  // Fetch images when user data is loaded
  useEffect(() => {
    if (user._id) {
      fetchImages();
    }
  }, [user._id]);

  // Fetch images when category changes
  useEffect(() => {
    if (user._id) {
      fetchImages();
    }
  }, [selectedCategory]);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('category', selectedCategory);
      formData.append('photographerId', user._id);

      const response = await axios.post('http://localhost:9000/photographers/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.data.success == true) {
        fetchImages();
      } else {
        throw new Error(response.data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <div className="photographer-details-container">
        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
          </div>
        )}
        {/* Header Section */}
        <div className="photographer-header">
          <div className="photographer-info">
            <div className="photographer-image">
              <img
                src={`http://localhost:9000/${user?.profileImage}`}
                className="rounded-circle"
                alt={user?.name}
              />
            </div>
            <div className="photographer-details">
              <h2 className="photographer-name">{user?.name}</h2>
              <h5 className="photographer-location">{user?.city}</h5>
              <p className="photographer-bio">{user?.bio}</p>
              <div className="photographer-stats">
                <p className="stat-item">Phone: {user?.phone}</p>
                <p className="stat-item">Email: {user?.email}</p>
                <p className="stat-item">Language: {user?.language}</p>
              </div>
            </div>
          </div>
          <div className="edit-profile-btn">
            <Link to="/edit_photographer_profile">
              <button className="btn btn-success">Edit Profile</button>
            </Link>
          </div>
        </div>

        {/* Gallery Filter Section */}
        <div className="gallery-filters">
          <div className="filter-buttons">
            {['Wedding', 'Pre-Wedding', 'Portfolio', 'Ring Ceremony', 'Birthday', 'Baby-Shower'].map(category => (
              <button
                key={category}
                type="button"
                className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => {
                  setSelectedCategory(category);
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Section */}
        <div className="gallery-section">
          <div className="photographer-work">
            <div className="upload-section">
            <div className="image-preview">
                {sImages.map((image, index) => (
                  <img
                    key={index}
                    src={`http://localhost:9000/${image?.imageUrl}`}
                    alt="preview"
                    className="preview-image"
                  />
                ))}
              </div>
              <h4>Upload Your Latest Images</h4>
              <div className="upload-container">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="upload-input"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="upload-btn">
                  Choose Image
                </label>
              </div>
              <div className="upload-status">
                {uploading && <p>Uploading...</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default PhotographerProfile;
