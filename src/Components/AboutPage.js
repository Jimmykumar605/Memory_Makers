import React, { useState } from "react";
import { carouselimages } from "../Config/config";

function AboutPage() {
  const [photo, setPhoto] = useState(carouselimages);
  return (
    <>
      <div className="">
        <div className="about-section">
          <img
            src={photo[0].image}
            className="d-block w-100 crslimg"
            alt="..."
          />
          <div className="about_text_centered">
            <h5>Since 2023</h5>
            <h1>Wedding and Family photographers community</h1>
            <p>
              Get inspired by beautiful photos, discuss, communicate with other
              photographers, receive requests from couples in love!
            </p>
          </div>
        </div>
        <div className="pt-5 pb-5 text-center container">
          <h2>We are Memory Makers</h2>
          <p>
            Welcome to Memory Makers, a vibrant photographers' community where
            creativity and memories come to life! Our website serves as a
            platform for talented photographers from various genres to showcase
            their work and connect with customers who are seeking exceptional
            photography services.
          </p>
          <p>
            At Memory Makers, we understand the power of capturing moments that
            are cherished for a lifetime. Whether it's a wedding, family
            portrait, special event, or any other occasion, our community of
            skilled photographers is dedicated to preserving your precious
            memories with their expertise and artistic vision.
          </p>
        </div>
      </div>
    </>
  );
}

export default AboutPage;
