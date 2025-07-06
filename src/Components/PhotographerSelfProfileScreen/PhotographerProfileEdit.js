import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { message, notification } from "antd";

function PhotographerProfileEdit(props) {
  const [imageFile, setImageFile] = useState();
  const [file, setFile] = useState();
  const [inputField, setInputField] = useState({
    user_name: "",
    // surname: "",
    user_email_id: "",
    user_phone_no: "",
    user_location: "",
    userImageUrl: "",
  });
  const [errField, setErrField] = useState({
    nameErr: "",
    // surnameErr: "",
    cityErr: "",
    numberErr: "",
  });
  const validForm = () => {
    let formIsValid = true;
    setErrField({
      nameErr: "",
      // surnameErr: "",
      cityErr: "",
      numberErr: "",
    });

    if (inputField.user_name === "") {
      formIsValid = false;
      setErrField((prevState) => ({
        ...prevState,
        nameErr: "Please enter name",
      }));
    }
    if (inputField.surname === "") {
      formIsValid = false;
      setErrField((prevState) => ({
        ...prevState,
        surnameErr: "Please enter surname",
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

    return formIsValid;
  };
  const sessionKey = "user";

  //
  const updateInputField = (user_details) => {
    setInputField((prevInputField) => ({
      ...prevInputField,
      user_name: user_details.user_name,
      user_email_id: user_details.user_email_id,
      user_phone_no: user_details.user_phone_no,
      user_location: user_details.user_location,
    }));
  };
  useEffect(() => {
    const user_details = JSON.parse(sessionStorage.getItem(sessionKey));
    console.log("--user_details", user_details);
    updateInputField(user_details);
  }, [sessionStorage.getItem(sessionKey)]);
  const inputHandler = (e) => {
    setInputField({ ...inputField, [e.target.name]: e.target.value });
  };
  function handleChange(e) {
    console.log(e.target.files);
    setImageFile(e.target.files[0]);
    // axios.post('/image', )
    setFile(URL.createObjectURL(e.target.files[0]));
  }
  // useEffect(() => {
  //   console.log('inputField', inputField)

  //   return () => {

  //   }
  // }, [inputField])

  const submitButton = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    if (validForm()) {
      const formDetails = Object.fromEntries(formData.entries());
      Object.assign(inputField, props);
      const userData = sessionStorage.getItem("user");
      const parseData = JSON.parse(userData);
      const url = `http://localhost:9000/update/${parseData.id}`;

      try {
        let ImageUrl = "";
        if (imageFile !== undefined) {
          const imageFormData = new FormData();
          imageFormData.append("profile", imageFile);

          const res = await axios.post(
            "http://localhost:9000/upload",
            imageFormData
          );
          ImageUrl = res?.data?.profileUrl;
          formDetails.user_image = ImageUrl;
        }

        const res = await axios.patch(url, formDetails);
        // console.log('res patch', res);
        console.log("res.data.success", res.data.success);
        if (res.data.success) {
          notification.success({
            message: "update Success",
            description: res.data.message,
          });
          // let updated_inputs = {
          //   name: formDetails.user_name,
          //   phone_no: formDetails.user_phone_no,
          //   location: formDetails.user_location,
          // };
          let sessionValues = JSON.parse(sessionStorage.getItem("user"));
          let UpdateSessionObject = {
            ...sessionValues,
            user_location: formDetails.user_location,
            user_phone_no: formDetails.user_phone_no,
            user_name: formDetails.user_name,
          };
          let updated_inputs_string = JSON.stringify(UpdateSessionObject);
          sessionStorage.setItem("user", updated_inputs_string);
          // console.log("updated_inputs_string :>> ", updated_inputs_string);
        } else {
          notification.error({
            message: "Update Failed",
            description: res.data.message,
          });
        }
      } catch (e) {
        notification.error("Something went wrong!");
      }
    } else {
      message.error("Form Invalid");
    }
  };

  //       await axios
  //         .post("http://localhost:9000/upload", imageFormData)
  //         .then((res) => {
  //           //fetch image url
  //           ImageUrl = res?.data?.profileUrl;
  //           formDetails.user_image = ImageUrl;

  //           // formData.append("userImageUrl", ImageUrl)
  //         });

  //       console.log("formDetails", formDetails);
  //     }
  //     await axios.patch(url, formDetails).then((res) => {
  //       console.log("res patch", res);
  //     });

  //     message.success("Form submitted successfully!");
  //     // let userId = sessionStorage.getItem("user");
  //     // console.log("userId", userId);
  //     // if (validForm()) {
  //     //   Object.assign(inputField, props);
  //     // console.log("userId", userId);
  //     // return false;
  //     // let url = "http://localhost:9000/update/";
  //     // let options = {
  //     //   method: "POST",
  //     //   url: url,
  //     //   data: inputField,
  //     // };
  //     // try {
  //     //   let response = await axios(options);
  //     //   if (response.data.statusText === "Success") {
  //     //     toast.success(response.data.message);
  //     //   } else {
  //     //     toast.error(response.data.message);
  //     //   }
  //     // } catch (e) {
  //     //   toast.error("Something went wrong!");
  //     // }
  //   } catch (e) {
  //     message.error("Something went wrong!");
  //   }
  // } else {
  //   message.error("Form Invalid");
  // }

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
                  src="./images/photographer/photographer1.jpg"
                />
                <span className="font-weight-bold">{inputField.user_name}</span>
                <div>
                  <div class="d-flex justify-content-center mb-4">
                    <img
                      src={file}
                      class="rounded-circle"
                      alt=""
                      style={{ width: "200px", height: "200px" }}
                    />
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
                  {/* <div className="col-md-4">
                    <label className="form-label">Surname</label>
                    <input
                      className="form-control"
                      type="text"
                      name="surname"
                      autoComplete="off"
                      value={inputField.surname}
                      onChange={inputHandler}
                    />
                    {errField.surnameErr.length > 0 && (
                      <span className="error" style={{ color: "red" }}>
                        {errField.surnameErr}
                      </span>
                    )}
                  </div> */}
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
