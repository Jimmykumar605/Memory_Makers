import React, { useRef, useState } from "react";
import { Link, Outlet, useHistory } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import ResetPassword from "./ResetPassword";
import "../../degisn/forgot.css";

function OtpForm() {
  const emailRef = useRef();
  const [OtpForm, showForm] = useState(true);
  const sendOtp = async () => {
    try {
      let url = "";
      let options = {
        method: "POST",
        url: url,
        data: { email: emailRef.current.value },
      };
      let response = await axios(options);
      let record = response.data;
      if (record.statusText === "Success") {
        toast.success(record.message);
        showForm(false);
      } else {
        toast.error(record.message);
      }
    } catch (e) {
      // toast.error("Something went wrong!");
      console.log("Error");
    }
  };

  return (
    <div className="otp_form d-flex justify-content-center align-items-center bg-dark">
      <div className="forgot">
        <div className="">
          <ToastContainer />
          <div className="">
            <Link to="/login">
              <button
                type="button"
                style={{ float: "right" }}
                className="btn-close "
                aria-label="Close"
              ></button>
            </Link>
            <h3 className="">Reset Password</h3>
          </div>
          <br />
          <p className="mb-5">
            Specify your email address, and we will send you a OTP to reset the
            password
          </p>
          {OtpForm ? (
            <form autoComplete="off" id="otpform" method="post">
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  className="form-control"
                  type="email"
                  autoComplete="off"
                  name="email"
                  ref={emailRef}
                ></input>
              </div>
              <div>
                <button
                  className="btn btn-danger"
                  type="button"
                  onClick={sendOtp}
                >
                  Send OTP
                </button>
                &nbsp;
                <Link to="/login">
                  <button className="btn btn-dark m-3" type="button">
                    Back
                  </button>
                </Link>
              </div>
            </form>
          ) : (
            <ResetPassword email={emailRef.current.value} />
          )}
        </div>
      </div>
    </div>
  );
}

export default OtpForm;
