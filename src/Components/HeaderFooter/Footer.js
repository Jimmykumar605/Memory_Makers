import React from "react";
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGem,
  faHome,
  faPhone,
  faPrint,
} from "@fortawesome/free-solid-svg-icons";

function Footer() {
  return (
    <>
      <footer className="  text-dark text-center text-lg-start">
        <section className="border-top  py-2">
          <div className="container text-center text-md-start mt-3">
            <div className="row">
              <div className="col-md-3 col-lg-4 col-xl-3 mx-auto mb-4">
                <h6 className="text-uppercase fw-bold mb-4">
                  <FontAwesomeIcon icon={faGem} className="me-2" />
                  Memory Makers
                </h6>
                <p className="mb-0">
                  That Website will provide you world's best photographers with
                  years of experience.
                </p>
              </div>
              <div className="col-md-2 col-lg-2 col-xl-2 mx-auto mb-4 ">
                <h6 className="text-uppercase fw-bold mb-4">Products</h6>
                <p className="mb-1">
                  <NavLink
                    to="/"
                    className="text-reset text-decoration-none fhover"
                  >
                    Home
                  </NavLink>
                </p>
                <p className="mb-1">
                  <NavLink
                    to="/about"
                    className="text-reset text-decoration-none fhover"
                  >
                    About us
                  </NavLink>
                </p>
                <p className="mb-1">
                  <NavLink
                    to="/login"
                    className="text-reset text-decoration-none fhover"
                  >
                    Login
                  </NavLink>
                </p>
              </div>
              <div className="col-md-4 col-lg-3 col-xl-3 mx-auto mb-md-0 mb-4">
                <h6 className="text-uppercase fw-bold mb-4">Contact</h6>
                <p className="mb-1">
                  <FontAwesomeIcon icon={faHome} className="me-2" />
                  SAS Nagar, Mohali, Punjab
                </p>
                <p className="mb-1">
                  <FontAwesomeIcon icon={faPhone} type="tel" className="me-2" />
                  + 01 234 567 88
                </p>
                <p className="mb-1">
                  <FontAwesomeIcon icon={faPrint} type="tel" className="me-2" />
                  + 01 234 567 89
                </p>
              </div>
            </div>
          </div>
        </section>
        <div className="text-center ">© 2023 MemoryMakers.com</div>
      </footer>
    </>
  );
}

export default Footer;
