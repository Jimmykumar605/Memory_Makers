import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthProvider";
import { getSessionData } from "../../Utils/Utils";

function UserIcon() {
  const [user, setUser] = useState(null);
  const { setAuth } = useContext(AuthContext);
  const navigate = useNavigate();

  const sessionData = getSessionData("USER_DATA");

  useEffect(() => {
    if (sessionData) {
      setUser(sessionData);
    }
  }, [sessionData]);
  const handleLogout = () => {
    sessionStorage.removeItem("USER_DATA");
    setAuth(false);
    navigate("/Login");
  };

  if (user && user.name) {
    return (
      <div className="d-flex">
        <div className="dropdown">
          <button
            className="btn nav-link dropdown-toggle text-light"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            {user.name}
          </button>
          <ul className="dropdown-menu bg-dark">
            <li>
              <Link
                className="dropdown-item text-light"
                to={
                  user.user_type !== "customer"
                    ? "/photographer_profile"
                    : "/client-profile"
                }
              >
                Profile info
              </Link>
            </li>
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
            <Link className="nav-link" to="/login">
              Login
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/signup">
              Sign up
            </Link>
          </li>
        </ul>
      </div>
    );
  }
}

export default UserIcon;
