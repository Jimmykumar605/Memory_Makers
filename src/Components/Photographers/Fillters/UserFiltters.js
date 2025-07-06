import { useState } from "react";
import photographer_data from "../../../assets/Photographers";

function UFillers() {
  const [speciality, setSpeciality] = useState(photographer_data);
  return (
    <>
      <div className="row">
        <div className="col-4">
          <label className="mb-2">
            <b>Photographer's speciality</b>
          </label>
          <select className="form-select" aria-label="Default select example">
            <option selected>Select the speciality</option>
            {speciality.map((data) => (
              <option value="1" key={data.id}>
                {data.Pspeciality}
              </option>
            ))}
            ;
          </select>
        </div>
        <div className="col-4">
          <label for="points" className="mb-2">
            <b>Charges per hour</b>
          </label>
          <select className="form-select" aria-label="Default select example">
            <option selected>Open this select menu</option>
            <option value="1">200$-500$</option>
            <option value="2">600$-1500$</option>
            <option value="3">1600$-2500$</option>
            <option value="2">3000$-5000$</option>
            <option value="3">6000$-1000$</option>
            <option value="2">12000$-20000$</option>
          </select>
        </div>
        <div className="col-4">
          <label for="points" className="mb-2">
            <b>Language</b>
          </label>
          <select className="form-select" aria-label="Default select example">
            <option selected>Open this select menu</option>
            <option value="1">One</option>
            <option value="2">Two</option>
            <option value="3">Three</option>
          </select>
        </div>
      </div>
    </>
  );
}
export default UFillers;
