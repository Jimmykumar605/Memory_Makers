import React, { useState } from "react";
import PhotosGallery from "./PhotosGallery";
import { mainphotographers } from "../Config/config";
import {
  mainimages,
  babyshower,
  wedding,
  prewedding,
  portfolio,
  birthday,
  ringcermony,
} from "../Config/config";

function PhotographerDetailsPage() {
  // console.log(mainimages);
  const [sImages, setImages] = useState(mainimages);

  return (
    <>
      <div className="container">
        <div className="text-center">
          <div className="row pt-5 d-flex align-items-center para-line">
            <div className="col-4 image_width">
              <img
                src={mainphotographers[0].image}
                className="rounded-circle"
                alt="photographer"
              />
            </div>
            <div className="col-8 text-start experience">
              <h2>Photographer {mainphotographers[0].name}</h2>
              <h5> {mainphotographers[0].city}</h5>
              <p className="text-justify"> {mainphotographers[0].bio}</p>
              <div>
                <p> {mainphotographers[0].experience}</p>
                <p>{mainphotographers[0].language}</p>
                <p>{mainphotographers[0].email}</p>
                <p>{mainphotographers[0].phone}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="headingbutton text-center m-3">
          <div className="d-grid gap-5 d-md-block ">
            <button
              type="button"
              className="btn button6"
              onClick={() => {
                setImages(wedding);
              }}
            >
              Wedding
            </button>
            <button
              type="button"
              className="btn button6"
              onClick={() => {
                setImages(prewedding);
              }}
            >
              Pre-Wedding
            </button>
            <button
              type="button"
              className="btn button6"
              onClick={() => {
                setImages(portfolio);
              }}
            >
              Portfolio
            </button>
            <button
              type="button"
              className="btn button6"
              onClick={() => {
                setImages(ringcermony);
              }}
            >
              Ring Ceremony
            </button>
            <button
              type="button"
              className="btn button6"
              onClick={() => {
                setImages(birthday);
              }}
            >
              Birthday
            </button>
            <button
              type="button"
              className="btn button6"
              onClick={() => {
                setImages(babyshower);
              }}
            >
              Baby-Shower
            </button>
          </div>
        </div>
        <div>
          <PhotosGallery imageData={sImages} />
        </div>
      </div>
    </>
  );
}

export default PhotographerDetailsPage;
