// src/pages/VerifyOtp.jsx
import React, { useState, useRef, useEffect } from "react";
import { sendOtp, verifyOtp } from "../../api/auth.js";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthDetailed } from "../../context/AuthContextDetailed.jsx";

function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();
  const { phoneNumber, email, method, otpType, otpLength } =
    location.state || {};
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [verifying, setVerifying] = useState(false);
  const [verifyElapsed, setVerifyElapsed] = useState(0);
  const verifyIntervalRef = useRef(null);

  const [resending, setResending] = useState(false);
  const [resendingElapsed, setResendingElapsed] = useState(0);
  const resendIntervalRef = useRef(null);

  console.log(
    `line 19 location state : ${phoneNumber}, ${email},${method}, ${otpType}, ${otpLength}`
  );

  // Automatically redirect to login if OTP has expired (2 minutes)
  useEffect(() => {
    const otpExpiryTime = 300000; // 5 minutes in milliseconds
    const timer = setTimeout(() => {
      // Optionally, you can display a message or use a modal instead of alert
      alert("OTP has expired. Please request a new one from main login page.");
      navigate("/"); // Adjust the route to your main login page
    }, otpExpiryTime);

    return () => clearTimeout(timer);
  }, [navigate]);

  const startVerifyTimer = () => {
    setVerifying(true);
    setVerifyElapsed(0);
    verifyIntervalRef.current = setInterval(() => {
      setVerifyElapsed((prev) => prev + 0.01);
    }, 10);
  };

  const stopVerifyTimer = () => {
    setVerifying(false);
    clearInterval(verifyIntervalRef.current);
  };

  const startResendingTimer = () => {
    setResending(true);
    setResendingElapsed(0);
    resendIntervalRef.current = setInterval(() => {
      setResendingElapsed((prev) => prev + 0.01);
    }, 10); // increment by 0.01 every 10ms => 100 times in a second
  };

  const stopResendingTimer = () => {
    setResending(false);
    clearInterval(resendIntervalRef.current);
  };

  // Get the login function from the Auth Context
  const { login, checkToken } = useAuthDetailed();

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    startVerifyTimer();

    if (!otp) {
      setError("Please enter the OTP.");
      // Capture error in Sentry
      //Sentry.captureException(err);
      return;
    }

    try {
      const response = await verifyOtp({ phoneNumber, email, otp });
      stopVerifyTimer();

      console.log(`Line 32 FE verifyOtp.jsx : ${response.msg}`);
      setSuccess(response.msg);
      // Store JWT token (if any) and navigate to dashboard or home
      // if (response.token) {
      //   localStorage.setItem('token', response.token);
      //   navigate('/dashboard'); // Change to your desired route
      // }
      // On successful OTP verification, mark the user as authenticated
      // login();
      // navigate("/dashboard");
      // response should contain { msg, token }
      // response.token => we store it
      if (response.token) {
        login({ token: response.token, email, phoneNumber });
        await checkToken();
        navigate("/dashboard");
      } else {
        stopVerifyTimer();
        setError("Authentication failed: no token returned.");
      }
    } catch (err) {
      stopVerifyTimer();
      if (err.errors) {
        const messages = err.errors.map((error) => error.msg).join(", ");
        setError(messages);
        // Capture error in Sentry
        // Sentry.captureException(err);
      } else {
        setError(err.msg || "Failed to verify OTP");
        // Capture error in Sentry
        // Sentry.captureException(err);
      }
    }
  };

  // TO DO
  const handleResend = async (e) => {
    e.preventDefault();
    setError("");

    startResendingTimer();

    console.log("resending Data:", {
      phoneNumber,
      email,
      method,
      otpType,
      otpLength,
    });

    // Input Validation
    if (!phoneNumber && !email) {
      setError(
        "Please provide either a phone number or an email. Looks like it is missed while routing in location.state"
      );
      return;
    }

    if (!["whatsapp", "sms", "email"].includes(method)) {
      setError(
        "Invalid method selected. Location.state doesnt seem to contain the method"
      );
      return;
    }

    try {
      await sendOtp({ phoneNumber, email, method, otpType, otpLength });
      stopResendingTimer();
      setError("");
      // Navigate to OTP Verification Page, passing necessary data
      //navigate("/verify-otp", { state: { phoneNumber, email, method } });
    } catch (err) {
      stopResendingTimer();
      setError(err.msg || `Failed to re-send OTP ${err.msg}`);
      // Capture error in Sentry
      //Sentry.captureException(err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow">
        <h1 className="text-2xl font-bold text-green-500 text-center">
          Verify OTP
        </h1>
        {verifying && (
          <div className="text-center text-green-600 mb-4">
            Verifying OTP... Elapsed: {verifyElapsed.toFixed(2)}s
          </div>
        )}

        {resending && (
          <div className="text-center text-green-600 mb-4">
            Resending OTP... Elapsed: {resendingElapsed.toFixed(2)}s
          </div>
        )}
        <form onSubmit={handleVerify} className="space-y-4">
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter your OTP"
            className="w-full px-3 py-2 border rounded"
          />
          <button
            type="submit"
            className="w-full px-3 py-2 text-white bg-green-500 rounded hover:bg-green-600 transition duration-300"
          >
            {verifying ? "Verifying OTP..." : "Verify OTP"}
          </button>

          {error && (
            <button
              onClick={handleResend}
              className="w-full px-3 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 transition duration-300"
            >
              {resending ? "Resending OTP..." : "Resend OTP"}
            </button>
          )}
        </form>
        {error && <p className="text-red-500 text-center">{error}</p>}
        {success && <p className="text-green-500 text-center">{success}</p>}
      </div>
    </div>
  );
}

export default VerifyOtp;
