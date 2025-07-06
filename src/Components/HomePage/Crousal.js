import React, { useState } from "react";
import { carouselimages } from "../../Config/config";
import { Link } from "react-router-dom";
function Crousal() {
  const [photo, setPhoto] = useState(carouselimages);
  return (
    <>
      <div
        id="carouselExampleDark"
        className="carousel carousel-dark slide "
        data-bs-ride="carousel"
      >
        <div className="carousel-indicators">
          <button
            type="button"
            data-bs-target="#carouselExampleDark"
            data-bs-slide-to="0"
            className="active"
            aria-current="true"
            aria-label="Slide 1"
          ></button>
          <button
            type="button"
            data-bs-target="#carouselExampleDark"
            data-bs-slide-to="1"
            aria-label="Slide 2"
          ></button>
          <button
            type="button"
            data-bs-target="#carouselExampleDark"
            data-bs-slide-to="2"
            aria-label="Slide 3"
          ></button>
          <button
            type="button"
            data-bs-target="#carouselExampleDark"
            data-bs-slide-to="3"
            aria-label="Slide 4"
          ></button>
          <button
            type="button"
            data-bs-target="#carouselExampleDark"
            data-bs-slide-to="4"
            aria-label="Slide 5"
          ></button>
          <button
            type="button"
            data-bs-target="#carouselExampleDark"
            data-bs-slide-to="5"
            aria-label="Slide 6"
          ></button>
          <button
            type="button"
            data-bs-target="#carouselExampleDark"
            data-bs-slide-to="6"
            aria-label="Slide 7"
          ></button>
          <button
            type="button"
            data-bs-target="#carouselExampleDark"
            data-bs-slide-to="7"
            aria-label="Slide 8"
          ></button>
          <button
            type="button"
            data-bs-target="#carouselExampleDark"
            data-bs-slide-to="8"
            aria-label="Slide 9"
          ></button>
        </div>
        <div className="carousel-inner">
          <div className="carousel-item active " data-bs-interval="2000">
            <img
              src={photo[1].image}
              className="d-block w-100 crslimg"
              alt="..."
            />
          </div>

          <div className="carousel-item" data-bs-interval="2000">
            <img
              src={photo[2].image}
              className="d-block w-100 crslimg"
              alt="..."
            />
          </div>
          <div className="carousel-item" data-bs-interval="2000">
            <img
              src={photo[3].image}
              className="d-block w-100 crslimg"
              alt="..."
            />
          </div>
          <div className="carousel-item" data-bs-interval="2000">
            <img
              src={photo[4].image}
              className="d-block w-100 crslimg"
              alt="..."
            />
          </div>
          <div className="carousel-item" data-bs-interval="2000">
            <img
              src={photo[5].image}
              className="d-block w-100 crslimg"
              alt="..."
            />
          </div>
          <div className="carousel-item" data-bs-interval="2000">
            <img
              src={photo[6].image}
              className="d-block w-100 crslimg"
              alt="..."
            />
          </div>
          <div className="carousel-item" data-bs-interval="2000">
            <img
              src={photo[7].image}
              className="d-block w-100 crslimg"
              alt="..."
            />
          </div>
          <div className="carousel-item" data-bs-interval="2000">
            <img
              src={photo[8].image}
              className="d-block w-100 crslimg"
              alt="..."
            />
          </div>
          <div className="carousel-item" data-bs-interval="2000">
            <img
              src={photo[9].image}
              className="d-block w-100 crslimg"
              alt="..."
            />
          </div>
        </div>
        <button
          className="carousel-control-prev"
          type="button"
          data-bs-target="#carouselExampleDark"
          data-bs-slide="prev"
        >
          <span
            className="carousel-control-prev-icon"
            aria-hidden="true"
          ></span>
          <span className="visually-hidden">Previous</span>
        </button>
        <button
          className="carousel-control-next"
          type="button"
          data-bs-target="#carouselExampleDark"
          data-bs-slide="next"
        >
          <span
            className="carousel-control-next-icon"
            aria-hidden="true"
          ></span>
          <span className="visually-hidden">Next</span>
        </button>
        <div className="carousel-caption d-sm-block">
          <div className="">
            <h1 className=" text-white heading">
              Find A Best Photographer For Capture Your Memories..
            </h1>
          </div>
          <div className="button">
            <div className="dropdown">
              <Link
                className="btn btn-sm text-nowrap searchbuton col-lg-5"
                type="button"
                id="dropdownMenuButton1"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <span>Search Photographer</span>
              </Link>

              <ul
                className="dropdown-menu bar col-sm-10"
                aria-labelledby="dropdownMenuButton1"
              >
                <li>
                  <Link
                    className="dropdown-item baritem"
                    to="/photographers_grid"
                  >
                    Wedding
                  </Link>
                </li>
                <li>
                  <Link
                    className="dropdown-item baritem"
                    to="/photographers_grid"
                  >
                    Pre-Wedding
                  </Link>
                </li>
                <li>
                  <Link
                    className="dropdown-item baritem"
                    to="/photographers_grid"
                  >
                    Ring Cermony
                  </Link>
                </li>
                <li>
                  <Link
                    className="dropdown-item baritem"
                    to="/photographers_grid"
                  >
                    Birthday Shoot
                  </Link>
                </li>
                <li>
                  <Link
                    className="dropdown-item baritem"
                    to="/photographers_grid"
                  >
                    Portfolio Shoot
                  </Link>
                </li>
                <li>
                  <Link
                    className="dropdown-item baritem"
                    to="photographers_grid"
                  >
                    Party Shoot
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Crousal;
