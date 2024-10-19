import Cookies from "js-cookie";
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

interface PrivateRouteProps {
  element: React.ReactElement;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ element, ...rest }) => {
  const location = useLocation();
  const isLoggedIn = Cookies.get("isLoggedIn");

  return isLoggedIn ? (
    <>{element}</>
  ) : (
    <Navigate to="/" state={{ from: location }} />
  );
};

export default PrivateRoute;
