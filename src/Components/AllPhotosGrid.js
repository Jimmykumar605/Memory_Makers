import React, { useState } from "react";
import PhotosGallery from "./PhotosGallery";
import { allphotos } from "../Config/config";

function AllPhotosGrid() {
  const [sImages] = useState(allphotos);
  return (
    <>
      <div className="mt-3 pb-5">
        <div className="heading m-3 p-3">
          <h1>Best Photographs</h1>
        </div>
        <PhotosGallery imageData={sImages} />
      </div>
    </>
  );
}

export default AllPhotosGrid;
