import React, { useState, useEffect } from "react";
import { apiGet } from "../../Utils/Utils";
// import Swiper core and required modules
import { Navigation, Pagination, Scrollbar, A11y } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";

import { Link } from "react-router-dom";

const ImageSections = () => {
  const [person, setPerson] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPhotographers = async () => {
      try {
        const response = await apiGet({
          endpoint: "/all_photographers",
          baseURL: "http://localhost:9000"
        });
        if(response?.data?.success === true){
          setPerson(response?.data?.photographers);
        }else{
          setPerson([]);
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotographers();
  }, []);
  const sessionData = JSON.parse(sessionStorage.getItem("user"));
  // console.log(sessionData);
  return (
    <>
      <div className="">
        <div>
          {person.length > 0 ? person.map((data) => (
            <div className="container row pt-5 d-flex align-items-center mt-5 rr">
              <div className="image_full_screen">
                {/* Full screen image dispalyed  */}
                <div id="exampleModal" class="modal">
                  <div class="modal-dialog modal-fullscreen">
                    <div class="modal-content modalcolor">
                      <div
                        class="modal-header"
                        // style={{ backgroundImage: data.img }}
                      >
                        <h5 class="modal-title">{data.name}</h5>
                        <button
                          type="button"
                          class="btn-close"
                          data-bs-dismiss="modal"
                          aria-label="Close"
                        ></button>
                      </div>
                      <div class="modal-body">
                        <p>{data.content}</p>
                        <Swiper
                          // install Swiper modules
                          modules={[Navigation, Pagination, Scrollbar, A11y]}
                          spaceBetween={50}
                          slidesPerView={3}
                          navigation
                          pagination={{ clickable: true }}
                          scrollbar={{ draggable: true }}
                          // onSwiper={(swiper) => console.log(swiper)}
                          // onSlideChange={() => console.log("slide change")}
                        >
                          <SwiperSlide>
                            <img
                              className="innerphoto"
                              src={data.img1}
                              alt=""
                            />
                          </SwiperSlide>
                          <SwiperSlide>
                            <img
                              className="innerphoto"
                              src={data.img2}
                              alt=""
                            />
                          </SwiperSlide>
                          <SwiperSlide>
                            <img
                              className="innerphoto"
                              src={data.img3}
                              alt=""
                            />
                          </SwiperSlide>
                          <SwiperSlide>
                            <img
                              className="innerphoto"
                              src={data.img4}
                              alt=""
                            />
                          </SwiperSlide>
                          <SwiperSlide>
                            <img
                              className="innerphoto"
                              src={data.img5}
                              alt=""
                            />
                          </SwiperSlide>
                          <SwiperSlide>
                            <img
                              className="innerphoto"
                              src={data.img6}
                              alt=""
                            />
                          </SwiperSlide>
                          <SwiperSlide>
                            <img
                              className="innerphoto"
                              src={data.img7}
                              alt=""
                            />
                          </SwiperSlide>
                          <SwiperSlide>
                            <img
                              className="innerphoto"
                              src={data.img8}
                              alt=""
                            />
                          </SwiperSlide>
                        </Swiper>
                      </div>
                    </div>
                  </div>
                  <div
                    class="modal fade"
                    id="exampleModalToggle2"
                    aria-hidden="true"
                    aria-labelledby="exampleModalToggleLabel2"
                    tabindex="-1"
                  >
                    <div class="modal-dialog modal-fullscreen-sm-down">
                      <div class="modal-content">
                        <div class="modal-header">
                          <h5 class="modal-title" id="exampleModalToggleLabel2">
                            Modal 2
                          </h5>
                          <button
                            type="button"
                            class="btn-close"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                          ></button>
                        </div>
                        <div class="modal-body">
                          Hide this modal and show the first with the button
                          below.
                        </div>
                        <div class="modal-footer">
                          {}
                          <button
                            class="btn btn-primary"
                            data-bs-target="#exampleModalToggle"
                            data-bs-toggle="modal"
                            data-bs-dismiss="modal"
                          >
                            Back to first
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* <ReactFullscreenCarousel slides={photos} handleClose={() => setOpen(false)} startSlideIndex={0} /> */}
              </div>
              <div className="row">
                <div className="col-12 col-md-3">
                  <div className="text-center photographer_name">
                    <Link to={sessionData ? "/photographer_details" : "/login"}>
                      {data.name}
                    </Link>
                  </div>
                  <Link to={sessionData ? "/photographer_details" : "/login"}>
                    <img
                      className="profile-pic"
                      src={"http://localhost:9000/" + data.profileImage}
                      alt={data.name}
                    />
                  </Link>
                </div>
                <div className="col-12 col-md-9">
                  <p className="location-data">
                    {data.city},{data.country}
                  </p>
                  <div className="row p-data">
                    <div className="col-col-12 col-md-4">
                      <img
                        data-bs-toggle="modal"
                        data-bs-target="#exampleModal"
                        className="rounded-2 photocrsl"
                        src={data.img1}
                        alt={data.name}
                      />
                    </div>
                    <div className="col-col-12 col-md-4">
                      <img
                        data-bs-toggle="modal"
                        data-bs-target="#exampleModal"
                        className="rounded-2 photocrsl"
                        src={data.img2}
                        alt={data.name}
                      />
                    </div>
                    <div className="col-col-12 col-md-4">
                      <img
                        data-bs-toggle="modal"
                        data-bs-target="#exampleModal"
                        className="rounded-2 photocrsl"
                        src={data.img3}
                        alt={data.name}
                      />
                    </div>
                    <div className="col-col-12 col-md-4">
                      <img
                        data-bs-toggle="modal"
                        data-bs-target="#exampleModal"
                        className="rounded-2 photocrsl"
                        src={data.img4}
                        alt={data.name}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-6 mt-3">
                      <h6 className="p-text-content">{data.content}</h6>
                    </div>
                    <div className="col-6 text-end mt-4">
                      <Link
                        to={
                          sessionData
                            ? "/photographer_details"
                            : "/photographer_details"
                        }
                      >
                        <button className="visit-btn btn">Visit profile</button>
                      </Link>
                      {/* )} */}
                      {/* <button className=" btn btn-primary">Send request</button> */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <div className="text-center py-5">
              <div className="text-muted mb-3">
                <i className="fas fa-camera fa-4x"></i>
              </div>
              <h5 className="text-muted">No Photographers Found</h5>
              <p className="text-muted">It seems there are no photographers available at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ImageSections;
