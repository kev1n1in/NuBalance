import Cookies from "js-cookie";
import { Navigate, useLocation } from "react-router-dom";
import { PrivateRouteProps } from "../types/GlobalComponents";

const PrivateRoute = ({ element }: PrivateRouteProps) => {
  const location = useLocation();
  const isLoggedIn = Cookies.get("isLoggedIn");

  return isLoggedIn ? (
    <>{element}</>
  ) : (
    <Navigate to="/" state={{ from: location }} />
  );
};

export default PrivateRoute;
