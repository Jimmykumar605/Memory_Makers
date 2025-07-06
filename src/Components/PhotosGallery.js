import React, { useEffect, useState } from "react";
function PhotosGallery(props) {
  const { imageData } = props;
  const [gallery, setGallery] = useState([]);

  useEffect(() => {
    if (imageData) {
      setGallery(imageData);
    }
  }, [imageData]);

  return (
    <>
      <div className="grid-wrapper container mb-2">
        {gallery.map((items) => {
          return (
            <div key={items.id}>
              <img className="zoom" src={items.image} alt={items.description} />
            </div>
          );
        })}
      </div>
    </>
  );
}

export default PhotosGallery;
