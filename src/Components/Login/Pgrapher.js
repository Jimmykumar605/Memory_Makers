import React from 'react';
import {useState} from 'react';

export default function Pgrapher() {

    const[sUpdate,setUpdate]=useState({
        name:true,
        email:false,
        password:false,
        confirm_password:false,
        phone:false,
        city:false,
        language:false,
        image:false,
      });
  return (
    <>
       { sUpdate?.photographers && <Photographers  setUpdate={setName}/>}
       { sUpdate?.photographercitylanguage && <PhotographerCityLanguage  setUpdate={setName}/>}
       { sUpdate?. photographerphoto && <PhotographerPhoto  setUpdate={setName}/>}
    </>
  )
}
