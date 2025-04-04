// src/pages/Authentication/Login.jsx
import React, { useState, useEffect, useRef } from "react";
import { sendOtp } from "../../api/auth.js";
import { useNavigate } from "react-router-dom";
// import { ToastContainer, toast } from "react-toastify";
import namamiLogo from "../../../src/assets/images/namAmi.png";
import quipriseLogo from "../../../src/assets/images/Quiprise.png";

import googleLogo from "../../../src/assets/images/google.png";
import { useAuthDetailed } from "../../context/AuthContextDetailed.jsx";

// import * as Sentry from '@sentry/react';

function Login() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [method, setMethod] = useState("email"); // Default method
  const [otpType, setOtpType] = useState("numeric"); // Default OTP type
  const [otpLength, setOtpLength] = useState(6); // Default OTP length
  const [error, setError] = useState("");

  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpElapsed, setOtpElapsed] = useState(0);
  const otpIntervalRef = useRef(null);

  const navigate = useNavigate();

  // src/pages/Login.jsx
  // ... existing imports and component code

  const { isAuthenticated } = useAuthDetailed();

  // If already authenticated, skip login
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const startSendingTimer = () => {
    setSendingOtp(true);
    setOtpElapsed(0);
    otpIntervalRef.current = setInterval(() => {
      setOtpElapsed((prev) => prev + 0.01);
    }, 10); // increment by 0.01 every 10ms => 100 times in a second
  };

  const stopSendingTimer = () => {
    setSendingOtp(false);
    clearInterval(otpIntervalRef.current);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Start the sending timer
    startSendingTimer();

    console.log("Submitting Data:", {
      phoneNumber,
      email,
      method,
      otpType,
      otpLength,
    });

    // Input Validation
    if (!phoneNumber && !email) {
      setError("Please provide either a phone number or an email.");
      return;
    }

    if (!["whatsapp", "sms", "email"].includes(method)) {
      setError("Invalid method selected.");
      return;
    }

    try {
      await sendOtp({ phoneNumber, email, method, otpType, otpLength });
      stopSendingTimer();
      // Navigate to OTP Verification Page, passing necessary data
      navigate("/verify-otp", {
        state: { phoneNumber, email, method, otpType, otpLength },
      });
    } catch (err) {
      stopSendingTimer();
      setError(err.msg || `Failed to send OTP ${err.msg}`);
      // Capture error in Sentry
      //Sentry.captureException(err);
    }
  };

  // ... rest of the component

  // On Google sign in, simply redirect the user to the backend endpoint.
  // The backend handles Google OAuth and then redirects to our callback route.
  const handleGoogleSignIn = () => {
    window.location.href = "http://localhost:5050/auth/google";
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      {/* <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      /> */}
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow">
        {/* App header with logo and app name */}
        <div className="flex items-center justify-center space-x-4">
          <img src={quipriseLogo} alt="Quiprise Logo" className="w-24 h-24" />
          {/* <h1 className="text-3xl font-bold text-blue-700">namAmi</h1> */}
        </div>
        <h1 className="text-2xl font-bold text-purple-500 text-center">
          Login / Signup
        </h1>

        {/* If sending OTP, show a loading text & elapsed time */}
        {sendingOtp && (
          <div className="text-center text-blue-600 mb-4">
            Sending OTP... Elapsed: {otpElapsed.toFixed(2)}s
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Phone Number Input */}
          <input
            type="tel"
            pattern="[0-9]{10}"
            value={phoneNumber}
            onChange={(e) => {
              console.log("Phone Number Input:", e.target.value);
              setPhoneNumber(e.target.value);
            }}
            placeholder="Enter your mobile number"
            className="w-full px-3 py-2 border rounded"
            disabled={method === "email"} // Disable if email method is selected
          />

          {/* Email Input */}
          <input
            type="email"
            value={email}
            onChange={(e) => {
              console.log("email input ", e.target.value);
              setEmail(e.target.value);
            }}
            placeholder="Enter your Email Address"
            className="w-full px-3 py-2 border rounded"
            disabled={method !== "email"} // Disable unless email method is selected
          />

          {/* Method Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Send OTP via:
            </label>
            <div className="flex items-center space-x-4 mt-2">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="method"
                  value="whatsapp"
                  checked={method === "whatsapp"}
                  onChange={(e) => setMethod(e.target.value)}
                  className="form-radio"
                  disabled
                />
                <span className="ml-2">WhatsApp</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="method"
                  value="sms"
                  checked={method === "sms"}
                  onChange={(e) => setMethod(e.target.value)}
                  className="form-radio"
                  disabled
                />
                <span className="ml-2">SMS</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="method"
                  value="email"
                  checked={method === "email"}
                  onChange={(e) => setMethod(e.target.value)}
                  className="form-radio"
                />
                <span className="ml-2">Email</span>
              </label>
            </div>
          </div>

          {/* OTP Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              OTP Type:
            </label>
            <select
              value={otpType}
              onChange={(e) => setOtpType(e.target.value)}
              className="w-full px-3 py-2 border rounded mt-2"
            >
              <option value="numeric">Numeric</option>
              <option value="alphanumeric">Alphanumeric</option>
              <option value="alphanumeric_special">
                Alphanumeric with Special Characters
              </option>
            </select>
          </div>

          {/* OTP Length Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              OTP Length:
            </label>
            <select
              value={otpLength}
              onChange={(e) => setOtpLength(parseInt(e.target.value))}
              className="w-full px-3 py-2 border rounded mt-2"
            >
              <option value={4}>4</option>
              <option value={5}>5</option>
              <option value={6}>6</option>
              <option value={7}>7</option>
              <option value={8}>8</option>
              <option value={9}>9</option>
              <option value={10}>10</option>
              <option value={11}>11</option>
              <option value={12}>12</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={sendingOtp}
            className="w-full px-3 py-2 text-white bg-purple-500 rounded hover:bg-purple-600 transition duration-300"
          >
            {sendingOtp ? (
              "Sending OTP..."
            ) : (
              <>
                Send OTP via{" "}
                {method === "email"
                  ? "Email"
                  : method === "sms"
                  ? "SMS"
                  : "WhatsApp"}
              </>
            )}
          </button>
        </form>

        {/* Error Message */}
        {error && <p className="text-red-500 text-center">{error}</p>}

        {/* Divider */}
        <div className="flex items-center my-4">
          <hr className="flex-grow border-gray-300" />
          <span className="px-4 text-gray-500">OR</span>
          <hr className="flex-grow border-gray-300" />
        </div>
        {/* Google Sign-In Button */}
        <button
          onClick={handleGoogleSignIn}
          className="flex items-center justify-center w-full px-3 py-2 border rounded hover:bg-gray-100 transition duration-300"
        >
          <img src={googleLogo} alt="Google Logo" className="w-6 h-6 mr-2" />
          <span className="font-medium text-purple-700">
            Sign in with Google
          </span>
        </button>
      </div>
    </div>
  );
}

export default Login;
