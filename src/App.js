import "./App.css";
import Navbar from "./Components/HeaderFooter/Navbar";
import { HashRouter, Route, Routes } from "react-router-dom";
import { lazy, Suspense, useState, useEffect } from 'react';
import LoadingScreen from './Components/LoadingScreen';
import Footer from "./Components/HeaderFooter/Footer";
import PhotographerDetailsPage from "./Components/PhotographerDetailsPage";
import PhotographerProfile from "./Components/PhotographerSelfProfileScreen/PhotographerProfile";
import AllPhotosGrid from "./Components/AllPhotosGrid";
import AboutPage from "./Components/AboutPage";
import ClientProEdit from "./Components/ClientSelfProfileScreen/ClientProfileEdit";
import PhotographerProfileEdit from "./Components/PhotographerSelfProfileScreen/PhotographerProfileEdit";
import LoginData from "./Components/Login/LoginData";
import AppLogin from "./Components/Login/Login";
import OtpForm from "./Components/forgot/OtpForm";
import Thanks from "./Components/Login/Thanks";
import CardGrid from "./Components/HomePage/Card";
import ContactForm from "./Components/Contact/ContactForm";
import { AuthProvider } from "./Components/context/AuthProvider";
import PhotographersGrids from "./Components/Photographers/Photographer_grids";
import ClientProfile from "./Components/ClientSelfProfileScreen/Clientprofile";

const Landingpage = lazy(() => import("./Components/HomePage/Landingpage"));

const LoadingWithTimer = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // 2 seconds delay

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return children;
};

function App() {
  const [name, setName] = useState({
    signup: true,
    customer: false,
    photographers: false,
    thanks: false,
    photographercitylanguage: false,
    photographerphoto: false,
    login: true,
  });
  return (
    <AuthProvider>
      <HashRouter>
        <Navbar />
        <Routes>
          <Route index element={
            <Suspense fallback={<LoadingScreen />}>
              <LoadingWithTimer>
                <Landingpage />
              </LoadingWithTimer>
            </Suspense>
          } />
          <Route path="/allphotosgrid" element={<AllPhotosGrid />} />
          <Route path="/photogellery" element={<AllPhotosGrid />} />
          <Route
            path="/login"
            element={name?.login && <AppLogin setName={setName} />}
          />
          <Route path="/contact" element={<ContactForm />} />
          <Route path="/photographers_grid" element={<PhotographersGrids />} />
          <Route path="user_info" element={<ClientProfile />} />
          <Route
            path="/photographer_details/:id"
            element={<PhotographerDetailsPage />}
          />
          <Route path="change_profile" element={<ClientProEdit />} />
          <Route
            path="/PhotographerProfileEdit"
            element={<PhotographerProfileEdit />}
          />
          <Route
            path="/edit_photographer_profile"
            element={<PhotographerProfileEdit />}
          />
          {/* <Route
            path="/photographer_profile"
            element={<PhotographerProfile />}
          /> */}
          <Route path="/about" element={<AboutPage />} />
          <Route path="/signup" element={<LoginData />} />
          <Route path="/Thanks" element={<Thanks />} />

          <Route path={"/client-profile"} element={<ClientProfile />} />
          <Route path="change_profile" element={<ClientProEdit />} />
          <Route
            path="edit_photographer"
            element={<PhotographerProfileEdit />}
          />
          <Route
            path="/photographer_profile"
            element={<PhotographerProfile />}
          />
          <Route path="/ClientProEdit" element={<ClientProEdit />} />
          <Route path="/forgot" element={<OtpForm />} />
        </Routes>
        <Footer />
      </HashRouter>
    </AuthProvider>
  );
}

export default App;
