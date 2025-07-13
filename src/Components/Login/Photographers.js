import React from "react";
import { message, notification } from "antd";
import { useState } from "react";
import { useFormik } from "formik";
import { signUPSchema } from "../schemas";
import axios from "axios";
import { useNavigate } from "react-router";
const initialValues = {
  name: "",
  email: "",
  password: "",
  confirm_password: "",
  phone: "",
  city: "",
  language: "",
  experience: "",
};

export default function Photographers(props) {
  const navigate = useNavigate();
  const [user, setUser] = useState(false);
  const { values, errors, handleBlur, touched, handleChange, handleSubmit } =
    useFormik({
      initialValues: initialValues,
      validationSchema: signUPSchema,
      onSubmit: (values, { resetForm }) => {
        console.log(values);
        //this code send data to backend from
        try {
          axios
            // If you want to signup in your mobile device please change the localhost into ip 192.168.1.15
            .post("http://localhost:9000/photographer/signup", {
              name: values.name,
              user_email: values.email,
              user_password: values.password,
              phone: values.phone,
              city: values.city,
              language: values.language,
              user_login_id: values.email,
              experience: values.experience,
              user_type: "photographer",
            })
            .then((response) => {
              if (response.data.success) {
                notification.success({
                  message: "Login Success",
                  description: response.data.message,
                });
                navigate("/Thanks");
                setUser(true);
              } else {
                notification.error({
                  message: "Login Failed",
                  description: response.data.message,
                });
                setUser(false);
              }
            });
        } catch (error) {
          console.log(error);
        }
      },
    });

  return (
    <>
      <div className="signup_photographer d-flex justify-content-center align-items-center">
        <form
          className="signup justify-content-center align-items-center py-2 "
          onSubmit={handleSubmit}
        >
          <h2 className="mt-2">Photographer</h2>
          <div className=" mt-3">
            <div className="row">
              <div className="was-validated col">
                <label className="form-label">Name</label>
                <input
                  className="form-control "
                  type="name"
                  autoComplete="off"
                  name="name"
                  id="name"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                />
                <div className="invalid-feedback">Please enter your name</div>
                {errors.name && touched.name && <p>{errors.name}</p>}
              </div>
              <div className="col">
                <label className="form-label">Email</label>
                <input
                  className="form-control "
                  type="email"
                  autoComplete="off"
                  name="email"
                  id="email"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.email && touched.email && <p>{errors.email}</p>}
              </div>
            </div>
            <div className="row">
              <div className="col">
                <label className="form-label">Password</label>
                <input
                  className="form-control "
                  type="password"
                  autoComplete="off"
                  name="password"
                  id="password"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.password && touched.password && (
                  <p>{errors.password}</p>
                )}
              </div>
              <div className="col">
                <label className="form-label">Confirm Pass.</label>
                <input
                  className="form-control "
                  type="password"
                  autoComplete="off"
                  name="confirm_password"
                  id="confirm_password"
                  value={values.confirm_password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.confirm_password && touched.confirm_password && (
                  <p>{errors.confirm_password}</p>
                )}
              </div>
            </div>
            <div className="row">
              <div className="col">
                <label className="form-label">Phone Number</label>
                <input
                  className="form-control "
                  type="tel"
                  autoComplete="off"
                  name="phone"
                  id="phone"
                  // placeholder="Phone Number"
                  value={values.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                />
                {errors.phone && touched.phone && <p>{errors.phone}</p>}
              </div>
              <div className="col">
                <label className="form-label">Enter Experience</label>
                <input
                  className="form-control "
                  type="tel"
                  autoComplete="off"
                  name="experience"
                  id="experience"
                  // placeholder="Phone Number"
                  value={values.experience}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                />
                {errors.experience && touched.experience && <p>{errors.experience}</p>}
              </div>
              <div className="col">
                <label className="form-label">Enter City</label>
                <input
                  className="form-control "
                  type="name"
                  autoComplete="off"
                  name="city"
                  id="city"
                  // placeholder="City"
                  value={values.city}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.city && touched.city && <p>{errors.city}</p>}
              </div>
            </div>

            <div className="row">
              <div className="col">
                <label className="form-label">Language</label>
                <input
                  type="name"
                  className="form-control "
                  autoComplete="off"
                  name="language"
                  id="language"
                  // placeholder="Language"
                  value={values.language}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.language && touched.language && (
                  <p>{errors.language}</p>
                )}
              </div>
            </div>
          </div>

          <button
            style={{ float: "right" }}
            className="btn btn-success mt-3"
            type="submit"
          >
            Sign Up
          </button>

          <div>
            <button
              className=" btn btn-dark mt-3 mb-3"
              onClick={() => {
                props?.setName((prev) => {
                  return { ...prev, photographers: false, signup: true };
                });
              }}
            >
              Prev
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
