import React, { useState } from "react";
import { mainphotographers } from "../../Config/config";
import { Link } from "react-router-dom";

function Headphotographer() {
  const sessionData = JSON.parse(sessionStorage.getItem("user"));
  const [photographer, setPhotographer] = useState(mainphotographers);
  const handleLinkClick = () => {
    window.scrollTo(0, 0);
  };

  return (
    <>
      <div className="heading m-3">
        <h1>Our Best Photographer's</h1>
      </div>
      <div className="card-group container pb-5">
        {photographer.map((data) => {
          return (
            <div className="card m-2 img-thumbnail" key={data.id}>
              <Link
                onClick={handleLinkClick}
                className="text-decoration-none text-dark"
                to={sessionData ? "/photographer_details" : "/login"}
              >
                <img src={data.image} className="card-img-top" alt="..." />
              </Link>
              <div className="card-body">
                <h5 className="card-title">{data.name}</h5>
                <p className="card-text">{data.bio}</p>
              </div>
              <div className="card-footer ">
                <small className="text-body-secondary">{data.experience}</small>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default Headphotographer;
