// EmailVerified.js
import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";

const EmailVerified = () => {
  const history = useHistory();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const access = params.get("access");
    const refresh = params.get("refresh");

    if (access && refresh) {
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);

      // Optional: Store dummy user info in sessionStorage
      sessionStorage.setItem("userDetails", JSON.stringify({ username: "User" }));

      // Redirect to welcome
      history.push("/welcome");
    }
  }, [history]);

  return (
    <div className="d-flex align-items-center justify-content-center" style={{ height: "100vh" }}>
      <div className="text-center bg-white p-4 rounded shadow">
        <h3>Verifying...</h3>
        <p className="mt-3">Just a moment while we log you in.</p>
      </div>
    </div>
  );
};

export default EmailVerified;