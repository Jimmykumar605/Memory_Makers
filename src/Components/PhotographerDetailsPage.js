import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import PhotosGallery from "./PhotosGallery";
import { apiGet } from "../Utils/Utils";

function PhotographerDetailsPage() {
  const { id } = useParams();
  const [sImages, setImages] = useState({});
  const [photographer, setPhotographer] = useState(null);
  const [selected, setSelected] = useState('');

  useEffect(() => {
    const fetchPhotographer = async () => {
      try {
        const response = await apiGet({
          endpoint: `/photographers/${id}`,
          baseURL: "http://localhost:9000",
        });

        if (response?.data?.success === true) {
          const data = response.data;

          // Dynamically categorize based on actual category names from data
          const categorizedImages = {};

          data.images.forEach((img) => {
            const category = img.category;
            if (!categorizedImages[category]) {
              categorizedImages[category] = [];
            }
            categorizedImages[category].push(img.imageUrl);
          });

          setImages(categorizedImages);

          const firstAvailableCategory = Object.keys(categorizedImages)[0];
          setSelected(firstAvailableCategory || '');

          setPhotographer(data);
        } else {
          setPhotographer(null);
        }
      } catch (err) {
        console.log(err);
      }
    };

    fetchPhotographer();
  }, [id]);

  return (
    <div className="container">
      <div className="text-center">
        <div className="row pt-5 d-flex align-items-center para-line">
          <div className="col-4 image_width">
            <div className="photographer-image">
              <img
                src={photographer?.profileImage}
                className="rounded-circle"
                alt="photographer"
              />
            </div>
          </div>
          <div className="col-8 text-start experience">
            <h2>Photographer {photographer?.name}</h2>
            <h5>{photographer?.city}</h5>
            <p className="text-justify">{photographer?.bio}</p>
            <div>
              <p>{photographer?.experience}</p>
              <p>{photographer?.language}</p>
              <p>{photographer?.email}</p>
              <p>{photographer?.phone}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-5">
        <div className="col-12">
          <h3 className="text-center mb-4">Photographer's Work</h3>
          <div className="row">
            <div className="col-12 mb-3 d-flex flex-wrap gap-2 justify-content-center">
              {Object.keys(sImages).map((categoryKey) => (
                <button
                  key={categoryKey}
                  type="button"
                  className={`btn button6 ${selected === categoryKey ? "active" : ""}`}
                  onClick={() => setSelected(categoryKey)}
                >
                  {categoryKey}
                </button>
              ))}
            </div>

            <div className="col-12">
              {sImages[selected]?.length > 0 ? (
                <PhotosGallery images={sImages[selected]} />
              ) : (
                <p className="text-center">No images available for this category.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PhotographerDetailsPage;
