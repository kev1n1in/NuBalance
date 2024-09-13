import React from "react";
import { useLocation, Navigate } from "react-router-dom";
import Cookies from "js-cookie";

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
