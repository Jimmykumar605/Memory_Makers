import photographer_data from "../../../assets/Photographers";
import { useState } from "react";
function Geolocation() {
  // const [loc, setLoc] = useState(photographer_data);
  return (
    <>
      {/* <h3>Hello</h3> */}
      <div className="d-flex justify-content-center">
        <ul className="list-inline d-flex location-items">
          <li className="m-1">
            <a className="link-opacity-75-hover text-decoration-none">
              {photographer_data[0].country}
            </a>
          </li>
          <li className="m-1">
            <a className="link-opacity-75-hover text-decoration-none">
              {photographer_data[1].country}
            </a>
          </li>
          <li className="m-1">
            <a className="link-opacity-75-hover text-decoration-none">
              {photographer_data[2].country}
            </a>
          </li>
          <li className="m-1">
            <a className="link-opacity-75-hover text-decoration-none">
              {photographer_data[3].country}
            </a>
          </li>
          <li className="m-1">
            <a className="link-opacity-75-hover text-decoration-none">
              {photographer_data[4].country}
            </a>
          </li>
          <li className="m-1">
            <a className="link-opacity-75-hover text-decoration-none">
              {photographer_data[5].country}
            </a>
          </li>
          <li className="m-1">
            <a className="link-opacity-75-hover text-decoration-none">
              {photographer_data[6].country}
            </a>
          </li>
          <li className="m-1">
            <a className="link-opacity-75-hover text-decoration-none">
              {photographer_data[7].country}
            </a>
          </li>
          <li className="m-1">
            <a className="link-opacity-75-hover text-decoration-none">
              {photographer_data[8].country}
            </a>
          </li>
          <li className="m-1">
            <a className="link-opacity-75-hover text-decoration-none">
              {photographer_data[9].country}
            </a>
          </li>
        </ul>
      </div>
    </>
  );
}
export default Geolocation;
