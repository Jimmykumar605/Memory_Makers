import React from "react";
import { Navigate, useNavigate } from "react-router";

export default function Thanks(props) {
  const navigate = useNavigate();

  function handleClick() {
    try {
      navigate("/login");
    } catch (error) {
      console.log(`Error navigating to /login: ${error}`);
    }
  }

  return (
    <div className="signup_photographer d-flex justify-content-center align-items-center">
      <form className="signup justify-content-center align-items-center">
        <h2>Thanks for Registration!</h2>

        <div>
          <button
            className="btn btn-danger mt-3 mb-5"
            onClick={() => {
              handleClick();
            }}
          >
            Login Now...
          </button>
        </div>
      </form>
    </div>
  );
}
