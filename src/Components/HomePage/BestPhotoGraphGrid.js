import React, { useState } from "react";
import { mainimages } from "../../Config/config";
import PhotosGallery from "../PhotosGallery";
import { Link } from "react-router-dom";

function BestPhotoGraphGrid() {
  const [sImages] = useState(mainimages);

  // Get 6 random images
  const randomImages = Array.from(
    { length: 9 },
    () => sImages[Math.floor(Math.random() * sImages.length)]
  );

  return (
    <div className="container">
      <div className="heading m-3 p-3">
        <h1>Best Photographs of the Week</h1>
      </div>
      <div className="photo-gallery">
        {randomImages.map((image) => (
          <Link key={image.id} to="/photogellery">
            <div className="photo-card">
              <img className="image" src={image.image} alt={image.title} />
              <div className="image-overlay">
                <h2 className="image-title">{image.title}</h2>
                {/* Add additional overlay content if needed */}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default BestPhotoGraphGrid;
