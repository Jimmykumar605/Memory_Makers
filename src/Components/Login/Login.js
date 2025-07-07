import { Button, Checkbox, Form, Input, notification } from "antd";
import { useFormik } from "formik";
import { loginSchemas } from "../schemas/loginSchemas";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthProvider";
import { removeSessionData, setSessionData } from "../../Utils/Utils";
// import { PhotographerProtectedRoute, ClientProtectedRoute } from "./ProtectedRoutes";

const AppLogin = () => {
  const { auth, setAuth, currentUser, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  // const [user, setUser] = useState();
  const [isLoading, setIsLoading] = useState(false);
  // const [user, setUser] = useState();
  const onFinish = (values) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    handleLogin(values);
  };

  const handleLogin = async (values) => {
    console.log("Submitting form with values", values);

    try {
      // In case if you want to login in your mobile phone please change the localhost to ip 192.168.1.15
      const response = await axios.post("http://localhost:9000/login", {
        email: values.email,
        password: values.password,
      });

      if (response.data.success) {
        setSessionData("USER_DATA", response?.data?.user);
        notification.success({
          message: "Login Success",
          description: response.data.message,
        });

        if (response.data.user.user_type === "photographer") {
          navigate("/photographer_profile");
        } else {
          navigate("/photographers_grid");
        }
        setUser(response.data.user);
        console.log(response.data.user);
      } else {
        notification.error({
          message: "Login Failed",
          description: response.data.message,
        });
        setAuth({
          currentUser: null,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const { values, errors, touched, handleBlur, handleChange, handleSubmit } =
    useFormik({
      initialValues: {
        type: "",
        email: "",
        password: "",
      },
      validationSchema: loginSchemas,
      onSubmit: (values, action) => {
        console.log(values);
        action.resetForm();
        handleLogin(values);
      },
    });

  const handleLogout = (e) => {
    e.preventDefault();
    removeSessionData("USER_DATA");
    // setUser(false);
    setAuth(false);
    navigate("/Login");
  };

  return (
    <div className="signup_photographer d-flex justify-content-center align-items-center">
      {auth.currentUser ? (
        <div>
          <h2 className="text-center mb-4 ">
            Welcome, {auth.currentUser.name}!
          </h2>
          <Button
            type="primary"
            htmlType="button"
            onClick={(e) => handleLogout(e)}
          >
            Logout
          </Button>
        </div>
      ) : (
        <Form
          className="signup container justify-content-center"
          name="basic"
          initialValues={{
            remember: true,
          }}
          onFinish={onFinish}
          autoComplete="off"
        >
          <div>
            <h2 className="text-center mb-4">LOG IN</h2>
          </div>

          <Form.Item
            label="Username"
            className="form-label mb-3"
            name="email"
            rules={[
              {
                required: true,
                message: "Please input your username!",
              },
            ]}
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Password "
            className="form-label mb-3"
            name="password"
            rules={[
              {
                required: true,
                message: "Please input your password!",
              },
            ]}
            values={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item>
            <div className="d-flex justify-content-between">
              <Link to="/forgot" className="btn btn-sm mt-3">
                Forget Password ?
              </Link>
              <button
                className={`btn ${
                  isLoading ? "btn-secondary" : "btn-danger"
                } mt-3 `}
                htmlType="submit"
              >
                {isLoading ? "Loading..." : "Submit"}
              </button>
            </div>
          </Form.Item>
        </Form>
      )}
    </div>
  );
};
export default AppLogin;
