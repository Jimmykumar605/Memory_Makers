import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import useHistory, { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function ResetPassword(props) {
  const [inputField, setInputField] = useState({
    otpCode: "",
    password: "",
    cpassword: "",
  });
  // const history = useHistory();
  const navigate = useNavigate();
  const [errField, setErrField] = useState({
    otpCodeErr: "",
    passwordErr: "",
    cpasswordErr: "",
  });
  const validForm = () => {
    let formIsValid = true;
    setErrField({
      otpCodeErr: "",
      passwordErr: "",
      cpasswordErr: "",
    });
    if (inputField.otpCode === "") {
      formIsValid = false;
      setErrField((prevState) => ({
        ...prevState,
        otpCodeErr: "Please enter email",
      }));
    }
    if (inputField.password === "") {
      formIsValid = false;
      setErrField((prevState) => ({
        ...prevState,
        passwordErr: "Please enter password",
      }));
    }
    if (inputField.cpassword === "") {
      formIsValid = false;
      setErrField((prevState) => ({
        ...prevState,
        cpasswordErr: "Please enter confirm password",
      }));
    }
    if (
      inputField.cpassword !== "" &&
      inputField.password !== inputField.cpassword
    ) {
      formIsValid = false;
      setErrField((prevState) => ({
        ...prevState,
        cpasswordErr: "Password are not matched",
      }));
    }

    return formIsValid;
  };
  const inputHandler = (e) => {
    setInputField({ ...inputField, [e.target.name]: e.target.value });
  };

  const submitButton = async () => {
    if (validForm()) {
      Object.assign(inputField, props);
      let url = "";
      let options = {
        method: "POST",
        url: url,
        data: inputField,
      };
      try {
        let response = await axios(options);
        if (response.data.statusText === "Success") {
          toast.success(response.data.message);
          // history.push("/login");
          navigate("/login");
        } else {
          toast.error(response.data.message);
        }
      } catch (e) {
        toast.error("Something went wrong!");
      }
    } else {
      toast.error("Form Invalid");
    }
  };

  const changePassword = async () => {
    navigate("/");
  };

  return (
    <div className="otp_form d-flex align-items-center justify-content-center w-100 bg-dark">
      <div className="forgot">
        <form className="" autoComplete="off" action="" method="post">
          <ToastContainer />
          <div className="mb-3">
            <label className="form-label">OTP Code</label>
            <input
              className="form-control"
              type="email"
              name="otpCode"
              maxLength="4"
              autoComplete="off"
              value={inputField.otpCode}
              onChange={inputHandler}
            />
            {errField.otpCodeErr.length > 0 && (
              <span className="error">{errField.otpCodeErr}</span>
            )}
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              className="form-control"
              type="password"
              name="password"
              autoComplete="off"
              value={inputField.password}
              onChange={inputHandler}
            />
            {errField.passwordErr.length > 0 && (
              <span className="error">{errField.passwordErr}</span>
            )}
          </div>
          <div className="mb-3">
            <label className="form-label">Confirm Password</label>
            <input
              className="form-control"
              type="password"
              name="cpassword"
              autoComplete="off"
              value={inputField.cpassword}
              onChange={inputHandler}
            />
            {errField.cpasswordErr.length > 0 && (
              <span className="error">{errField.cpasswordErr}</span>
            )}
          </div>
          <div>
            <button
              className="btn btn-danger"
              type="button"
              onClick={submitButton}
            >
              Change Password
            </button>
            &nbsp;
            <Link to="/login">
              <button className="btn btn-danger" type="button">
                Back
              </button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
