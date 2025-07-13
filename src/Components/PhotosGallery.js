import React, { useEffect, useState } from "react";
function PhotosGallery(props) {
  const imageData = props?.images;
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
              <img className="zoom" src={"http://localhost:9000/" + items} alt={items} />
            </div>
          );
        })}
      </div>
    </>
  );
}

export default PhotosGallery;
