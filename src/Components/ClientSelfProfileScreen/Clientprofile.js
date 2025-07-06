import React from "react";
import photographer_data from "../../assets/Photographers";
import { Link } from "react-router-dom";

function ClientProfile() {
  const sessionData = JSON.parse(sessionStorage.getItem("user"));

  return (
    <>
      <div className="container mt-5">
        <div className="row d-flex justify-content-center m-3">
          <div className="col-md-7">
            <div className="card p-3 py-4">
              <div className="text-center">
                <img
                  src={photographer_data[0].img}
                  width="300"
                  className="rounded-circle"
                  alt="photographer"
                />
              </div>

              <div className="text-center mt-3">
                <h3 className="mt-2 mb-2">{sessionData.user_name}</h3>
                <p>{sessionData.user_location}</p>
                {/* <Link to="user_profile_edit" > */}
                <Link to="/change_profile">
                  <button className="btn btn-success">Edit Profile</button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ClientProfile;
