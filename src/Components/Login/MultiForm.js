import React, { useState } from 'react';
// import Form1 from './Form1';
import Form1 from './Photographers';
import Form2 from './PhotographerCityLanguage';
// import Form2 from './Form2';

function MultiForm() {
  const [form1Data, setForm1Data] = useState({});
  const [form2Data, setForm2Data] = useState({});

  const handleForm1Change = (data) => {
    setForm1Data(data);
  };

  const handleForm2Change = (data) => {
    setForm2Data(data);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // handle submission of all forms here
    console.log(form1Data, form2Data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Form1 onChange={handleForm1Change} />
      <Form2 onChange={handleForm2Change} />
      <button type="submit">Submit</button>
    </form>
  );
}

export default MultiForm;
