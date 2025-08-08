import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const EmailVerified = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const access = params.get("access_token");
    const refresh = params.get("refresh_token");

    if (access && refresh) {
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      navigate("/", { replace: true });
    } else {
      // No tokens found — maybe show an error or send them to login
      navigate("/sign-in", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md text-center animate-fade-in">
        <div className="flex justify-center mb-4">
          <svg
            className="w-12 h-12 text-indigo-500 animate-spin-slow"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 4v5h.582m15.356-2A9 9 0 113.582 7"
            />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-800">
          Verifying your email...
        </h3>
        <p className="mt-2 text-gray-600">
          Just a moment while we log you in automatically.
        </p>
      </div>

      <style>
        {`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fade-in 0.6s ease-out forwards;
          }
          .animate-spin-slow {
            animation: spin 2s linear infinite;
          }
        `}
      </style>
    </div>
  );
};

export default EmailVerified;
