// import { Route, Navigate, Outlet } from "react-router-dom";
// import { useContext } from "react";
// import { AuthContext } from "../context/AuthProvider";

// // Protected route for photographers
// function PhotographerProtectedRoute() {
//   const { currentUser } = useContext(AuthContext);

//   if (!currentUser) {
//     return <Navigate to="/login" replace />;
//   }

//   if (!currentUser.isPhotographer) {
//     return <Navigate to="/ClientProEdit" replace />;
//   }

//   return <Outlet />;
// }

// // Protected route for clients
// function ClientProtectedRoute() {
//   const { currentUser } = useContext(AuthContext);

//   if (!currentUser) {
//     return <Navigate to="/login" replace />;
//   }

//   if (!currentUser.isClient) {
//     return <Navigate to="/PhotographerProfileEdit" replace />;
//   }

//   return <Outlet />;
// }

// export { PhotographerProtectedRoute, ClientProtectedRoute };
