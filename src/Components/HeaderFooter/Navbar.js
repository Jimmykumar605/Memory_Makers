import React, { useState, useEffect } from "react";
import { Outlet, Link } from "react-router-dom";
import { logoimage } from "../../Config/config";
import UserIcon from "./NavUser";

function Navbar() {
  const [photo, setPhoto] = useState(logoimage);

  return (
    <>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
        <div className="container">
          <div className="col-5">
            {/* Logo */}
            <Link to="/">
              <img
                src={photo[0].image}
                className="logo-img"
                height="40"
                alt="Logo"
              />
            </Link>
          </div>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div
            className="collapse navbar-collapse justify-content-end"
            id="navbarNav"
          >
            {/* Navigation links */}
            <ul className="navbar-nav">
              <li className="nav-item">
                <Link
                  className="nav-link"
                  aria-current="page"
                  to="/photographers_grid"
                >
                  Photographers
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/photogellery">
                  Photos
                </Link>
              </li>

              <li className="nav-item">
                <UserIcon />
              </li>
            </ul>
          </div>
        </div>
      </nav>
      {/* Render nested routes */}
      <Outlet />
    </>
  );
}

export default Navbar;
