import React from "react";
import { useState } from "react";
import photographer_data from "../../assets/Photographers";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { getSessionData } from "../../Utils/Utils";
import "./PhotographerProfile.css";
function PhotographerProfile() {
  const [user, setUser] = useState({});
  const [sImages, setImages] = useState([]);

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

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prevImages => [...prevImages, reader.result]);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <div className="photographer-details-container">
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
            <button
              type="button"
              className="filter-btn active"
              onClick={() => setImages([])}
            >
              Wedding
            </button>
            <button
              type="button"
              className="filter-btn"
              onClick={() => setImages([])}
            >
              Pre-Wedding
            </button>
            <button
              type="button"
              className="filter-btn"
              onClick={() => setImages([])}
            >
              Portfolio
            </button>
            <button
              type="button"
              className="filter-btn"
              onClick={() => setImages([])}
            >
              Ring Ceremony
            </button>
            <button
              type="button"
              className="filter-btn"
              onClick={() => setImages([])}
            >
              Birthday
            </button>
            <button
              type="button"
              className="filter-btn"
              onClick={() => setImages([])}
            >
              Baby-Shower
            </button>
          </div>
        </div>

        {/* Gallery Section */}
        <div className="gallery-section">
          <div className="photographer-work">
            <div className="upload-section">
              <h4>Upload Your Latest Images</h4>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="upload-input"
              />
              <div className="image-preview">
                {sImages.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt="preview"
                    className="preview-image"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default PhotographerProfile;
