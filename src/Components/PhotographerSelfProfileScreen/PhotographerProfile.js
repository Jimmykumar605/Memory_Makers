import React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { apiGet, apiPost, getSessionData } from "../../Utils/Utils";
import "./PhotographerProfile.css";
function PhotographerProfile() {
  const [user, setUser] = useState({});
  const [sImages, setImages] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Wedding');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchImages = async () => {
    if (!user._id) return;

    try {
      setLoading(true);
      const response = await apiGet({
        endpoint: `/photographers/${user._id}/images/${selectedCategory}`
      });
      if (response.data.success == true) {
        setImages(response.data.images);
      } else {
        setImages([]);
      }
    } catch (error) {
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

  useEffect(() => {
    if (user._id) {
      fetchImages();
    }
  }, [user._id]);

  useEffect(() => {
    if (user._id) {
      fetchImages();
    }
  }, [selectedCategory]);

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);
    if (files.length === 0) return;

    setUploading(true);
    setUploadProgress(files.map(() => 0));

    try {
      const uploadPromises = files.map(async (file, index) => {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('category', selectedCategory);
        formData.append('photographerId', user._id);

        try {
          const response = await apiPost({
            endpoint: '/photographers/upload-image',
            data: formData
          });
          
          if (response.data.success == true) {
            // Update progress for this file
            const newProgress = [...uploadProgress];
            newProgress[index] = 100;
            setUploadProgress(newProgress);
          } else {
            throw new Error(response.data.message || 'Upload failed');
          }
        } catch (error) {
          console.error(`Error uploading image ${index + 1}:`, error);
          throw error;
        }
      });

      await Promise.all(uploadPromises);
      fetchImages();
    } catch (error) {
      console.error('Error uploading images:', error);
    } finally {
      setUploading(false);
      setUploadProgress([]);
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

        <div className="gallery-section">
          <div className="photographer-work">
            <div className="upload-section">
              {sImages.length > 0 ? 
                <div className="image-preview">
              {sImages.map((image, index) => (
                  <img
                    src={`http://localhost:9000/${image?.imageUrl}`}
                    alt="preview"
                    className="preview-image"
                  />
              ))}
                </div>
              : <p>No images uploaded yet</p>}
              <h4>Upload Your Latest Images</h4>
              <div className="upload-container">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="upload-input"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="upload-btn">
                  Choose Image
                </label>
              </div>
              <div className="upload-status">
                {uploading && (
                  <div>
                    <p>Uploading {selectedFiles.length} images...</p>
                    {uploadProgress.map((progress, index) => (
                      <div key={index} className="progress-bar">
                        <div className="progress" style={{ width: `${progress}%` }}></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default PhotographerProfile;
