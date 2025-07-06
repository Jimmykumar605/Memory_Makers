import React, { useState } from "react";
import { useFormik } from "formik";

const initialValues = {
  image: [],
};


export default function PhotographerPhoto(props) {

  const {values,handleBlur}=
  useFormik({
    initialValues:initialValues,
    onsubmit:(values,{resetForm})=>{
      console.log(values);
      resetForm();
      props?.setName((prev) => {
        return { ...prev, photographerphoto: false, thanks: true };
      });
      props?.setData((prev)=>{
        return{...prev,form3:values}
      })
    },
  });

  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <>
    <div className="wrapper d-flex justify-content-center align-items-center">
      <form className="signup container justify-content-center">
        {/* <h4>Uploaad photo</h4> */}
        <div>
          <h2>Profile PIC</h2>
          {selectedImage && (
            <div>
              <img
                alt="not found"
                width={"250px"}
                src={URL.createObjectURL(selectedImage)}
              />
              <br/>
              <button 
              className="btn btn-danger mt-3 mb-5" 
              onClick={() => setSelectedImage(null)}>Remove</button>   
            </div>
          )}
          <input
            type="file"
            name="myImage"
            value={values.image}
            // onChange={handleChange}
            onBlur={handleBlur}
            onChange={(event) => {
              console.log(event.target.files[0]);
              setSelectedImage(event.target.files[0]);
            }}
          />
        </div>

        <div>
          <button
           className="btn btn-danger mt-3 mb-5"
            onClick={() => {
              props?.setName((prev) => {
                return {
                  ...prev,
                  photographercitylanguage: true,
                  photographerphoto: false,
                };
              });
            }}
          >
            Prev
          </button>

          <button
            className="btn btn-danger mt-3 mb-5"
            style={{float:"right"}}
            type="submit"
            // onClick={() => {
            //   props?.setName((prev) => {
            //     return { ...prev, photographerphoto: false, thanks: true };
            //   });
            // }}
          >
            Sign Up
          </button>
        </div>
      </form>
    </div>
    </>
  );
}
