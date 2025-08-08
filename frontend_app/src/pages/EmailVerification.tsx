import React from "react";
import { Mail } from "lucide-react";

const EmailVerification = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md text-center animate-fade-in">
        <div className="flex justify-center mb-4">
          <div className="bg-indigo-100 p-4 rounded-full">
            <Mail className="w-10 h-10 text-indigo-500" />
          </div>
        </div>

        <h3 className="text-2xl font-bold text-gray-800">
          Almost there!
        </h3>

        <p className="mt-3 text-gray-600 leading-relaxed">
          We’ve sent a verification link to your email address.  
          Please check your inbox and click the link to verify your account.
        </p>

        <div className="mt-6">
          <p className="text-sm text-gray-500">
            Didn’t get the email? <a href="/resend-verification" className="text-indigo-500 hover:underline">Resend link</a>
          </p>
        </div>
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
        `}
      </style>
    </div>
  );
};

export default EmailVerification;
