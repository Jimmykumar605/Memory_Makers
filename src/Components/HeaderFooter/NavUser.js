import { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthProvider";
import UserContext from "../../UserContext";

function UserIcon() {
  console.log("UserIcon");
  const { setAuth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sessionUser = sessionStorage.getItem("user");
    if (sessionUser) {
      const parsedUser = JSON.parse(sessionUser);
      setUser(parsedUser);
    }
  }, [setUser]);

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    setUser(null);
    setAuth(false);
    navigate("/Login");
  };

  // const UloginHandler = () => {
  //   setReady(true);
  // };

  const sessionData = JSON.parse(sessionStorage.getItem("user"));

  console.log("sessionData", sessionData);
  if (sessionData && sessionData.id > 0) {
    return (
      <div className="d-flex">
        <div className="dropdown">
          <Link
            className="nav-link dropdown-toggle"
            to="#"
            role="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            {sessionData.user_name}
          </Link>
          <ul className="dropdown-menu bg-dark">
            {/* {sessionData.user_type !== "customer" && ( */}
            <li>
              <Link
                className="dropdown-item text-light"
                to={
                  sessionData.user_type !== "customer"
                    ? "photographer_profile"
                    : "/client-profile"
                }
              >
                Profile info
              </Link>
            </li>
            {/* )} */}
            <li>
              <Link
                className="dropdown-item text-light"
                to="/"
                onClick={handleLogout}
              >
                Logout
              </Link>
            </li>
          </ul>
        </div>
      </div>
    );
  } else {
    return (
      <div className="d-flex">
        <ul className="navbar-nav">
          <li className="nav-item">
            <Link
              className="nav-link "
              style={{ textDecoration: "none" }}
              to="/login"
            >
              Login
            </Link>
          </li>
          <li className="nav-item">
            <Link
              className="nav-link "
              style={{ textDecoration: "none" }}
              to="/signup"
            >
              Sign up
            </Link>
          </li>
        </ul>
      </div>
    );
  }
}

export default UserIcon;
