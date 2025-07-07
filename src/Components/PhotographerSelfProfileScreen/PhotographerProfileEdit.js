import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { message, notification } from "antd";
import { getSessionData } from "../../Utils/Utils";

function PhotographerProfileEdit(props) {
  const [imageFile, setImageFile] = useState();
  const [previewImage, setPreviewImage] = useState(null);
  const [inputField, setInputField] = useState({
    user_name: "",
    user_email_id: "",
    user_phone_no: "",
    user_location: "",
    language: "",
    userImageUrl: "",
  });

  // Helper function for email validation
  const isValidEmail = (email) => {
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    return emailRegex.test(email);
  };
  const [errField, setErrField] = useState({
    nameErr: "",
    cityErr: "",
    numberErr: "",
    emailErr: "",
    languageErr: ""
  });
  const validForm = () => {
    let formIsValid = true;
    setErrField({
      nameErr: "",
      cityErr: "",
      numberErr: "",
      emailErr: "",
      languageErr: ""
    });

    if (inputField.user_name === "") {
      formIsValid = false;
      setErrField((prevState) => ({
        ...prevState,
        nameErr: "Please enter name",
      }));
    }
    if (inputField.user_location === "") {
      formIsValid = false;
      setErrField((prevState) => ({
        ...prevState,
        cityErr: "Please enter your city",
      }));
    }
    if (inputField.user_phone_no === "") {
      formIsValid = false;
      setErrField((prevState) => ({
        ...prevState,
        numberErr: "Please enter your number",
      }));
    }

    // Email validation
    if (inputField.user_email_id === "") {
      formIsValid = false;
      setErrField((prevState) => ({
        ...prevState,
        emailErr: "Please enter your email",
      }));
    } else if (!isValidEmail(inputField.user_email_id)) {
      formIsValid = false;
      setErrField((prevState) => ({
        ...prevState,
        emailErr: "Please enter a valid email address",
      }));
    }

    // Language validation
    if (inputField.language === "") {
      formIsValid = false;
      setErrField((prevState) => ({
        ...prevState,
        languageErr: "Please enter your language",
      }));
    }

    return formIsValid;
  };

  //
  const updateInputField = (user_details) => {
    setInputField((prevInputField) => ({
      ...prevInputField,
      user_name: user_details?.name,
      user_email_id: user_details?.email,
      user_phone_no: user_details?.phone,
      user_location: user_details?.city,
      language: user_details?.language,
      userImageUrl: user_details?.userImageUrl,
    }));
  };
  useEffect(() => {
    const user_details = getSessionData("USER_DATA");
    console.log("user_details :>> ", user_details);
    updateInputField(user_details);
  }, []); 
  const inputHandler = (e) => {
    setInputField({ ...inputField, [e.target.name]: e.target.value });
  };
  function handleChange(e) {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  }

  const submitButton = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    if (validForm()) {
      const formDetails = Object.fromEntries(formData.entries());
      Object.assign(inputField, props);
      const userData = getSessionData("USER_DATA");
      const url = `http://localhost:9000/update/photographer/${userData._id}`;

        try {
          // Create a single FormData object for all data
          const formData = new FormData();
          formData.append("name", formDetails.user_name);
          formData.append("email", formDetails.user_email_id);
          formData.append("phone", formDetails.user_phone_no);
          formData.append("city", formDetails.user_location);
          formData.append("language", formDetails.language);          
          // Add image file if it exists
          if (imageFile) {
            formData.append("profile", imageFile);
          }

          // Send all data in a single request
          const res = await axios.post(url, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
        console.log('res :>>', res);
        if (res.data && res.data.success) {
          notification.success({
            message: "Profile Updated Successfully",
            description: res.data.message,
          });

          // Update the session data
          const updatedSessionData = {
            ...userData,
            user_name: formDetails.user_name,
            user_email_id: formDetails.user_email_id,
            user_phone_no: formDetails.user_phone_no,
            user_location: formDetails.user_location,
            language: formDetails.language,
            userImageUrl: res.data.userImageUrl
          };
          sessionStorage.setItem("USER_DATA", JSON.stringify(updatedSessionData));

          try {
            // Redirect to profile page
            window.location.href = "/photographer_profile";
          } catch (error) {
            throw new Error(error.message || "Failed to update profile");
          }

          try {
            let sessionValues = getSessionData("USER_DATA");
            let UpdateSessionObject = {
              ...sessionValues,
              user_location: formDetails.user_location,
              user_phone_no: formDetails.user_phone_no,
              user_name: formDetails.user_name,
              language: formDetails.language,
              userImageUrl: res.data.userImageUrl
            };
            let updated_inputs_string = JSON.stringify(UpdateSessionObject);
            sessionStorage.setItem("user", updated_inputs_string);
          } catch (error) {
            notification.error({
              message: "Update Failed",
              description: error.message || "Failed to update session data",
            });
          }
        } else {
          notification.error({
            message: "Update Failed",
            description: res.data.message,
          });
        }
      } catch (e) {
        notification.error({
          message: "Error",
          description: e.message || "Something went wrong!"
        });
      }
    } else {
      message.error("Form Invalid");
    }
  };

  return (
    <>
      <form
        className=""
        autoComplete="off"
        action=""
        method="post"
        encType="multipart/form-data"
        onSubmit={submitButton}
      >
        <div className="container rounded bg-white mt-5 mb-5">
          <div className="row">
            <div className="col-md-4 border-right">
              <div className="d-flex flex-column align-items-center text-center p-3 py-5">
                <img
                  className="rounded-circle mt-5"
                  width="250px"
                  alt=""
                  src={inputField.userImageUrl}
                />
                <div>
                  <div class="d-flex justify-content-center mb-4">
                    <div className="profile-image-preview">
                    {previewImage ? (
                      <img
                        src={previewImage}
                        className="rounded-circle"
                        alt="Preview"
                        style={{ width: "200px", height: "200px", objectFit: "cover" }}
                      />
                    ) : (
                      <img
                        src="./images/photographer/photographer1.jpg"
                        className="rounded-circle"
                        style={{ width: "200px", height: "200px" }}
                      />
                    )}
                  </div>
                  </div>
                  <div class="d-flex justify-content-center">
                    <div class="btn btn-primary btn-rounded">
                      <label
                        class="form-label text-white m-1"
                        for="customFile2"
                      >
                        Choose file
                      </label>
                      <input
                        name="user_image"
                        type="file"
                        class="form-control d-none"
                        id="customFile2"
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
                <span> </span>
              </div>
            </div>

            <div className="col-md-8 border-right">
              <div className="p-3 py-5 ">
                <div className=" align-items-center mb-3">
                  <h4 className="col-md-8 text-center">
                    Photographer Personal Info
                  </h4>
                </div>
                {/* <form className="" autoComplete="off" action="" method="post"> */}
                <div className="row mt-2">
                  <div className="col-md-4">
                    <label className="form-label">Name</label>
                    <input
                      className="form-control"
                      type="text"
                      name="user_name"
                      autoComplete="off"
                      value={inputField.user_name}
                      onChange={inputHandler}
                    />
                    {errField.nameErr.length > 0 && (
                      <span className="error" style={{ color: "red" }}>
                        {errField.nameErr}
                      </span>
                    )}
                  </div>
                </div>
                <div className="row mt-3">
                  <div className="col-md-8">
                    <label className="form-label">City</label>
                    <input
                      className="form-control"
                      type="text"
                      name="user_location"
                      autoComplete="off"
                      value={inputField.user_location}
                      onChange={inputHandler}
                    />
                    {errField.cityErr.length > 0 && (
                      <span className="error" style={{ color: "red" }}>
                        {errField.cityErr}
                      </span>
                    )}
                  </div>
                  <div className="col-md-8">
                    <label className="form-label">Email</label>
                    <input
                      className="form-control"
                      type="text"
                      name="user_email_id"
                      autoComplete="off"
                      value={inputField.user_email_id}
                      onChange={inputHandler}
                    />
                    {errField.emailErr.length > 0 && (
                      <span className="error" style={{ color: "red" }}>
                        {errField.emailErr}
                      </span>
                    )}
                  </div>
                  <div className="col-md-8">
                    <label className="form-label">Phone Number</label>
                    <input
                      className="form-control"
                      type="text"
                      name="user_phone_no"
                      autoComplete="off"
                      value={inputField.user_phone_no}
                      onChange={inputHandler}
                    />
                    {errField.numberErr.length > 0 && (
                      <span className="error" style={{ color: "red" }}>
                        {errField.numberErr}
                      </span>
                    )}
                  </div>
                  <div className="col-md-8">
                    <label className="form-label">Language</label>
                    <input
                      className="form-control"
                      type="text"
                      name="language"
                      autoComplete="off"
                      value={inputField.language}
                      onChange={inputHandler}
                    />
                    {errField.languageErr.length > 0 && (
                      <span className="error" style={{ color: "red" }}>
                        {errField.languageErr}
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-5 col-md-8 text-center">
                  <button
                    className="btn btn-success m-2"
                    type="submit"
                    // onClick={messageKey}
                  >
                    Update Changes
                  </button>
                  &nbsp;
                  <Link to="/photographer_profile">
                    <button className="btn btn-secondary m-2 " type="button">
                      Back
                    </button>
                  </Link>
                </div>
                {/* </form> */}
              </div>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}

export default PhotographerProfileEdit;
