import React from "react";
import { useState } from "react";
import photographer_data from "../../assets/Photographers";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { getSessionData } from "../../Utils/Utils";
function PhotographerProfile() {
  const [user, setUser] = useState({});

  useEffect(() => {
    try {
      const sessionData = getSessionData("USER_DATA");
      if (sessionData) {
        setUser(sessionData);
      }
    } catch (error) {
      console.log("error :>> ", error);
    }
  }, []);
  return (
    <>
      <div className="container">
        <div className="text-center">
          <div className="row pt-5">
            <div className="col-lg-2 col-md-2 col-8 m-auto pb-5">
              <img
                src={user?.img}
                className="rounded-circle"
                alt={user?.name}
              />
            </div>
            <div className="col-lg-6 col-10 m-auto text-start">
              <h2>Photographer {user?.name}</h2>
              <h5>{user?.user_location}</h5>
              <p>{user?.content}</p>
              <p>{user?.user_phone_no}</p>
            </div>
            <div className="col-lg-4  col-10 m-auto ">
              <div className="d-grid gap-2 col-8 mx-auto">
                <Link to="/edit_photographer_profile">
                  <button className="btn btn-success">Edit Profile</button>
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="headingbutton text-center m-3">
          <div className="d-grid gap-5 d-md-block">
            <button type="button" className="btn btn-primary m-1">
              Wedding
            </button>
            <button type="button" className="btn btn-primary m-1">
              Pre-Wedding
            </button>
            <button type="button" className="btn btn-primary m-1">
              Portfolio
            </button>
            <button type="button" className="btn btn-primary m-1">
              Ring Ceremony
            </button>
            <button type="button" className="btn btn-primary m-1">
              Birthday
            </button>
            <button type="button" className="btn btn-primary m-1">
              Baby-Shower
            </button>
          </div>
        </div>
        <div className="photographer-work">
          <div className="images"></div>
          <p className="text-center m-3">Upload Your Latest Images </p>
          <div className="text-center m-3">
            <button type="file" className="btn btn-primary m-1">
              Upload images
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default PhotographerProfile;
