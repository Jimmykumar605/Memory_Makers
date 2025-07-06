import "./Photographer_grid.css";
import Geolocation from "./Fillters/GeoLocations";
import UFillers from "./Fillters/UserFiltters";
import ImageSections from "../ClientSelfProfileScreen/ImagesSection";
function PhotographersGrids() {
  return (
    <>
      <div className="photogra">
        <div className="container">
          <div className="main-places">
            <div className="container">
              <h2 className="text-center dashboard-head">
                World’s Best Wedding Photographers
              </h2>
              {/* <Geolocation />
              <UFillers /> */}
            </div>
          </div>
          <ImageSections />
        </div>
      </div>
    </>
  );
}
export default PhotographersGrids;
