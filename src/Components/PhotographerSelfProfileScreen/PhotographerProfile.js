import React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { apiGet, apiPost, apiDelete, getSessionData, apiPut } from "../../Utils/Utils";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faTrash, faAdd, faRemove } from '@fortawesome/free-solid-svg-icons'
import "./PhotographerProfile.css";
function PhotographerProfile() {
  const [user, setUser] = useState({});
  const [sImages, setImages] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Wedding');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [hoveredImage, setHoveredImage] = useState(null);
  const [fullScreenImage, setFullScreenImage] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);
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
  }, [selectedCategory]);

  useEffect(() => {
    if (user._id) {
      fetchImages();
    }
  }, [user._id]);

  const addToPortfolio = async (imageId) => {
    try {
      const formData = new FormData();
      formData.append('imageId', imageId?._id);
      formData.append('category', selectedCategory);
      formData.append('userId', user._id);
      const response = await apiPost({
        endpoint: `/add_to_best_images`,
        data: formData
      });
      
      if (response.data.success == true) {
        console.log("response :>> ", response)
        // Refresh the images to show the updated portfolio status
        fetchImages();
        // Close the modal
        setFullScreenImage(null);
      } else {
        console.error('Server response:', response);
      }
    } catch (error) {
      console.error('Error adding to portfolio:', error);
    }
  };

  const removeFromBest = async (imageId) => {
    try {
      const formData = new FormData();
      formData.append('imageId', imageId?._id);
      formData.append('category', selectedCategory);
      formData.append('userId', user._id);
      const response = await apiPut({
        endpoint: `/remove_from_best_images`,
        data: formData
      });
      
      if (response.data.success == true) {
        // Refresh the images to show the updated portfolio status
        fetchImages();
        // Close the modal
        setFullScreenImage(null);
      } else {
        console.error('Server response:', response);
      }
    } catch (error) {
      console.error('Error removing from portfolio:', error);
    }
  };

  const handleDeleteImage = async () => {
    if (!imageToDelete) return;

    try {
      setLoading(true);
      const response = await apiDelete({
        endpoint: `/photographers/delete-image`,
        data: {
          imageId: imageToDelete,
          photographerId: user._id,
          category: selectedCategory
        },
      });
      if (response.data.success == true) {
        fetchImages();
        setDeleteModalOpen(false);
        setImageToDelete(null);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
    } finally {
      setLoading(false);
    }
  };

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
                src={`${user?.profileImage}`}
                className="rounded-circle"
                alt={user?.name}
              />
            </div>
            <div className="photographer-details">
              <h2 className="photographer-name">{user?.name}</h2>
              <h5 className="photographer-location">{user?.city}</h5>
              <p className="photographer-bio">{user?.bio}</p>
              <div className="photographer-stats">
                <p className="stat-item">Experience: {user?.experience}</p>
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
                  <div 
                    key={image._id}
                    className="image-container"
                    onMouseEnter={() => setHoveredImage(image._id)}
                    onMouseLeave={() => setHoveredImage(null)}
                  >
                    <div className="image-wrapper">
                      <img
                        src={image?.imageUrl}
                        alt="preview"
                        className="preview-image"
                      />
                    </div>
                    {hoveredImage === image._id && (
                      <div className="image-actions">
                        <button className="action-btn edit-btn" title="View Full Screen" onClick={() => setFullScreenImage(image)}>
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                        <button className="action-btn delete-btn" title="Delete" onClick={() => {
                          setImageToDelete(image._id);
                          setDeleteModalOpen(true);
                        }}>
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    )}
                  </div>
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

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <><div className="modal fade show d-block" role="dialog" style={{ display: 'block' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-dark text-white">
              <div className="modal-header">
                <h5 className="modal-title" id="deleteModalLabel">Are you sure?</h5>
                <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close" onClick={() => {
                  setDeleteModalOpen(false);
                  setImageToDelete(null);
                } }></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this image? This action cannot be undone.</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => {
                  setDeleteModalOpen(false);
                  setImageToDelete(null);
                } }>No</button>
                <button type="button" className="btn btn-danger" onClick={handleDeleteImage}>Yes</button>
              </div>
            </div>
          </div>
        </div><div className="modal-backdrop fade show"></div></>
      )}

      {/* Full Screen Image Modal */}
      {fullScreenImage && (
        <><div className="modal fade show d-block" role="dialog" style={{ display: 'block' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg" role="document" style={{ backgroundColor: '#1a1a1a' }}>
            <div className="modal-content" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>
              <div className="modal-header">
                <h5 className="modal-title text-white">Image Viewer</h5>
                {fullScreenImage?.best_image !== "Y" ? 
                  <button 
                      onClick={() => {
                      // Extract the image ID from the fullScreenImage path
                      const imageId = fullScreenImage;
                      addToPortfolio(imageId);
                    }} 
                      className="btn rounded-square p-2"
                      style={{ backgroundColor: '#0d6efd', borderColor: '#0d6efd' }}
                    >
                      <FontAwesomeIcon icon={faAdd} />
                    </button>
                : 
                <button 
                      onClick={() => {
                      // Extract the image ID from the fullScreenImage path
                      const imageId = fullScreenImage;
                      removeFromBest(imageId);
                    }} 
                      className="btn rounded-square p-2"
                      style={{ backgroundColor: '#0d6efd', borderColor: '#0d6efd' }}
                    >
                      <FontAwesomeIcon icon={faRemove} />
                    </button>}
                <button onClick={() => setFullScreenImage(null)} type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body text-white">
                <div className="text-center">
                  <img
                    src={fullScreenImage?.imageUrl}
                    alt="full screen"
                    className="img-fluid"
                    style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }} />
                </div>
              </div>
            </div>
          </div>
        </div><div className="modal-backdrop fade show"></div></>
      )}
    </>
  );
}

export default PhotographerProfile;
