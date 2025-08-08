import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  // Must match the key you set in SignIn
  const isLoggedIn = !!localStorage.getItem("access_token");
  const location = useLocation();

  if (!isLoggedIn) {
    return (
      <Navigate
        to={`/sign-in?redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  return children;
};

export default ProtectedRoute;
