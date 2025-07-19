// frontend_app/src/components/VerifyNotice.js
import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";

const VerifyNotice = () => {
  const history = useHistory();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const access = params.get("access_token");
    const refresh = params.get("refresh_token");

    if (access && refresh) {
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);

      // Optional: Fetch user info if you want to store in sessionStorage
      // sessionStorage.setItem("userDetails", JSON.stringify({ username: "User" }));

      history.push("/welcome");
    }
  }, [history]);

  return (
    <div className="d-flex align-items-center justify-content-center" style={{ height: '100vh' }}>
      <div className="text-center bg-white p-4 rounded shadow">
        <h3>Almost there!</h3>
        <p className="mt-3">
          We’ve sent a verification link to your email address. Please check your inbox and click the link to verify your account.
        </p>
      </div>
    </div>
  );
};

export default VerifyNotice;