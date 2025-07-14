import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { message, notification } from "antd";
import { getSessionData, apiPost, setSessionData } from "../../Utils/Utils";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function PhotographerProfileEdit(props) {
  const [imageFile, setImageFile] = useState();
  const [previewImage, setPreviewImage] = useState(null);
    const navigate = useNavigate();
  const [inputField, setInputField] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    language: "",
    profileImage: "",
    experience: "",
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
    languageErr: "",
    experienceErr: ""
  });
  const validForm = () => {
    let formIsValid = true;
    setErrField({
      nameErr: "",
      cityErr: "",
      numberErr: "",
      emailErr: "",
      languageErr: "",
      experienceErr: ""
    });

    if (inputField.name === "") {
      formIsValid = false;
      setErrField((prevState) => ({
        ...prevState,
        nameErr: "Please enter name",
      }));
    }
    if (inputField.city === "") {
      formIsValid = false;
      setErrField((prevState) => ({
        ...prevState,
        cityErr: "Please enter your city",
      }));
    }
    if (inputField.phone === "") {
      formIsValid = false;
      setErrField((prevState) => ({
        ...prevState,
        numberErr: "Please enter your number",
      }));
    }

    // Email validation
    if (inputField.email === "") {
      formIsValid = false;
      setErrField((prevState) => ({
        ...prevState,
        emailErr: "Please enter your email",
      }));
    } else if (!isValidEmail(inputField.email)) {
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
    if (inputField.experience === "") {
      formIsValid = false;
      setErrField((prevState) => ({
        ...prevState,
        experienceErr: "Please enter your experience",
      }));
    }
    return formIsValid;
  };

  //
  const updateInputField = (user_details) => {
    setInputField((prevInputField) => ({
      ...prevInputField,
      name: user_details?.name,
      email: user_details?.email,
      phone: user_details?.phone,
      city: user_details?.city,
      language: user_details?.language,
      profileImage: user_details?.profileImage,
      experience: user_details?.experience,
    }));
  };
  useEffect(() => {
    const user_details = getSessionData("USER_DATA");
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
      const userData = getSessionData("USER_DATA");

        try {
          // Create a single FormData object for all data
          const formData = new FormData();
          formData.append("name", formDetails.name);
          formData.append("email", formDetails.email);
          formData.append("phone", formDetails.phone);
          formData.append("city", formDetails.city);
          formData.append("language", formDetails.language);   
          formData.append("experience", formDetails.experience);       
          // Add image file if it exists
          if (imageFile) {
            formData.append("profile", imageFile);
          }

          const res = await apiPost({
            endpoint: `/update/photographer/${userData._id}`,
            data: formData,
          });
          if (res.data && res.data.success) {
          notification.success({
            message: "Profile Updated Successfully",
            description: res.data.message,
          });

          // Update the session data
          const updatedSessionData = {
            ...userData,
            name: formDetails.name,
            email: formDetails.email,
            phone: formDetails.phone,
            city: formDetails.city,
            language: formDetails.language,
            experience: formDetails.experience,
            profileImage: res.data.user.profileImage
          };
          setSessionData("USER_DATA", updatedSessionData);
          navigate("/photographer_profile");
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
                  src={inputField.profileImage}
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
                        src={inputField.profileImage}
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
                      name="name"
                      autoComplete="off"
                      value={inputField.name}
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
                      name="city"
                      autoComplete="off"
                      value={inputField.city}
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
                      name="email"
                      autoComplete="off"
                      value={inputField.email}
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
                      name="phone"
                      autoComplete="off"
                      value={inputField.phone}
                      onChange={inputHandler}
                    />
                    {errField.numberErr.length > 0 && (
                      <span className="error" style={{ color: "red" }}>
                        {errField.numberErr}
                      </span>
                    )}
                  </div>
                  <div className="col-md-8">
                    <label className="form-label">Experience</label>
                    <input
                      className="form-control"
                      type="text"
                      name="experience"
                      autoComplete="off"
                      value={inputField.experience}
                      onChange={inputHandler}
                    />
                    {errField.experienceErr.length > 0 && (
                      <span className="error" style={{ color: "red" }}>
                        {errField.experienceErr}
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
