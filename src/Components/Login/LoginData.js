// import React from "react";
import React, { useEffect } from "react";
import { useState } from "react";
import "./Login.css";
import Signup from "./Signup";
import Customer from "./Customer";
import Photographers from "./Photographers";
import PhotographerCityLanguage from "./PhotographerCityLanguage";
import PhotographerPhoto from "./PhotographerPhoto";
import Thanks from "./Thanks";
import Login from "./Login";
import AppLogin from "./Login";
function LoginData() {
  const [name, setName] = useState({
    signup: true,
    customer: false,
    photographers: false,
    thanks: false,
    photographercitylanguage: false,
    photographerphoto: false,
    login: false,
  });
  return (
    <>
      {name?.signup && <Signup setName={setName} />}
      {name?.customer && <Customer setName={setName} />}
      {name?.photographers && <Photographers setName={setName} />}
      {name?.thanks && <Thanks setName={setName} />}
      {name?.photographercitylanguage && (
        <PhotographerCityLanguage setName={setName} />
      )}
      {name?.photographerphoto && <PhotographerPhoto setName={setName} />}
      {name?.login && <AppLogin setName={setName} />}
    </>
  );
}

export default LoginData;
