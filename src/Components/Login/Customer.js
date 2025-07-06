import React from "react";
import { useFormik } from "formik";
import { signUPSchema } from "../schemas";
import { notification } from "antd";
import axios from "axios";
const initialValues = {
  name: "",
  email: "",
  password: "",
  confirm_password: "",
};

export default function Customer(props) {
  const { values, errors, handleBlur, touched, handleChange, handleSubmit } =
    useFormik({
      initialValues: initialValues,
      validationSchema: signUPSchema,
      onSubmit: async (values, action) => {
        console.log(values);
        //this code send data to backend from frontend

        try {
          const response = await axios.post(
            // If you want to signup in your mobile device please change the localhost into ip 192.168.1.15
            "http://localhost:9000/customer/signup",
            {
              name: values.name,
              user_email: values.email,
              user_password: values.password,
              confirm_password: values.confirm_password,
              user_login_id: values.email,
              user_type: "customer",
            }
          );
          if (response.data.success) {
            props?.setName((prev) => {
              return { ...prev, customer: false, thanks: true };
            });
            notification.success({
              message: "Sign up Success",
              description: response.data.message,
            });
          } else {
            notification.error({
              message: "Sign up Failed",
              description: response.data.message,
            });
          }
        } catch (error) {
          console.log(error);
        }

        console.log(errors.errors);
        // action.resetForm();
      },
    });
  return (
    <>
      <div className="signup_photographer d-flex justify-content-center align-items-center">
        <form
          className="signup  justify-content-center align-items-center"
          onSubmit={handleSubmit}
        >
          <h2>Customer</h2>
          <div className="was-validated">
            <label className="form-label">Name</label>
            <input
              className="form-control"
              type="name"
              autoComplete="off"
              name="name"
              id="name"
              // placeholder="Name"
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              required
            />
            <div className="invalid-feedback">Please enter your name</div>
            {errors.name && touched.name && <p>{errors.name}</p>}
          </div>
          <div>
            <label className="form-label">Email</label>
            <input
              className="form-control"
              type="email"
              autoComplete="off"
              name="email"
              id="email"
              //  placeholder="Email"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {errors.email && touched.email && <p>{errors.email}</p>}
          </div>
          <div>
            <label className="form-label">Password</label>
            <input
              className="form-control"
              type="password"
              autoComplete="off"
              name="password"
              id="password"
              //  placeholder="Password"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {errors.password && touched.password && <p>{errors.password}</p>}
          </div>
          <div>
            <label className="form-label">Confirm Password</label>
            <input
              className="form-control"
              type="password"
              autoComplete="off"
              name="confirm_password"
              id="confirm_password"
              // placeholder="Confirm Password"
              value={values.confirm_password}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {errors.confirm_password && touched.confirm_password && (
              <p>{errors.confirm_password}</p>
            )}
          </div>
          <div>
            <button
              className="btn btn-success  mt-3 mb-3"
              style={{ float: "right" }}
              type="submit"
            >
              Sign Up
            </button>
            <button
              className="btn btn-dark mt-3 mb-3"
              onClick={() => {
                props?.setName((prev) => {
                  return { ...prev, customer: false, signup: true };
                });
              }}
            >
              Prev
            </button>
          </div>
          {/* <button
            className="btn btn-danger mt-3 mb-5"
            style={{ float: "right" }}
            onClick={() => {
              props?.setName((prev) => {
                return { ...prev, customer: false, login: true };
              });
            }}
          >
            Login...
          </button> */}
        </form>
      </div>
    </>
  );
}
