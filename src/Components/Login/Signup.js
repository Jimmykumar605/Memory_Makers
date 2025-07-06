// Signup page
import React from "react";

export default function Signup(props) {
  //use props in function

  return (
    <>
      <div className="signup_photographer d-flex col-sm-12 justify-content-center align-items-center">
        <form className="signup text-center">
          <h1>SIGN UP</h1>
          <br />
          <div className="signn">
            <button
              className="btn btn-danger mb-3 m-2"
              onClick={() => {
                props?.setName((prev) => {
                  return { ...prev, signup: false, customer: true }; //this pass customer in props
                });
              }}
            >
              Customer
            </button>

            <br />
            <button
              className="btn btn-danger mb-3 m-2"
              onClick={() => {
                props?.setName((prev) => {
                  return { ...prev, signup: false, photographers: true }; //This pass photographer in props
                });
              }}
            >
              Photographer
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
