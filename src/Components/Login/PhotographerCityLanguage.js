import React, { useState } from "react";
import { useFormik } from "formik";
import { photoPhoneLangCitySchema } from "../schemas/photoPhoneLangCitySchema";

const initialValues = {
  phone: "",
  city: "",
  language: "",
  // dpimage:[],
};

export default function PhotographerCityLanguage(props) {
  const { values, errors, handleBlur, touched, handleChange, handleSubmit } =
    useFormik({
      initialValues: initialValues,
      validationSchema: photoPhoneLangCitySchema,
      onSubmit: (values, { resetForm }) => {
        console.log(values);
        resetForm();
        props?.setName((prev) => {
          return {
            ...prev,
            photographercitylanguage: false,
            thanks: true,
          };
        });
        props?.setData((prev) => {
          return { ...prev, form2: values };
        });
      },
    });

  // const [selectedImage, setSelectedImage] = useState(null);

  return (
    <div className="wrapper d-flex justify-content-center align-items-center">
      <form
        className="signup container justify-content-center"
        onSubmit={handleSubmit}
      >
        {/* <h4>Upload Your Image Here!</h4> */}
        <div className="was-validated">
          <label className="form-label">Phone Number</label>
          <input
            className="form-control"
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

        <div>
          <label className="form-label">City</label>
          <input
            className="form-control"
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

        <div>
          <label className="form-label">Language</label>
          <input
            type="name"
            className="form-control"
            autoComplete="off"
            name="language"
            id="language"
            // placeholder="Language"
            value={values.language}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {errors.language && touched.language && <p>{errors.language}</p>}
        </div>

        {/* <div>
        <label className="form-label">Image</label>
          {selectedImage && (
            <div>
              <img
                alt="not found"
                width={"250px"}
                className="form-control"
                src={URL.createObjectURL(selectedImage)}
                value={values.dpimage}
                onChange={handleChange}
               onBlur={handleBlur}
              />
              <br/>
              <button 
              className="btn btn-danger mt-3 mb-5" 
              onClick={() => setSelectedImage(null)}>Remove</button>
            </div>
          )}
          <br />
          <br />
          <input
            type="file"
            name="myImage"
            className="form-control"
            onChange={(event) => {
              console.log(event.target.files[0]);
              setSelectedImage(event.target.files[0]);
            }}
          />
        </div> */}

        <button
          className="btn btn-danger mt-3 mb-5"
          type="submit"
          style={{ float: "right" }}
        >
          Sign Up
        </button>

        <button
          className="btn btn-danger mt-3 mb-5"
          onClick={() => {
            props?.setName((prev) => {
              return {
                ...prev,
                photographers: true,
                photographercitylanguage: false,
              };
            });
          }}
        >
          Prev
        </button>
      </form>
    </div>
  );
}
