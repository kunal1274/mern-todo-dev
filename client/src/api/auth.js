// src/api/auth.js
import api from "./index";
import validateBackendUrl from "./validate-url";

export const sendOtp = async ({
  phoneNumber,
  email,
  method,
  otpType,
  otpLength,
}) => {
  console.log("src/api/auth.js = endOtp Payload:", {
    phoneNumber,
    email,
    method,
    otpType,
    otpLength,
  }); // Debug
  // console.log('VITE_PORT:', process.env.VITE_PORT);
  try {
    await validateBackendUrl();
  } catch (error) {
    console.error("URL Validation Failed:", error.message);
    alert("Unable to connect to backend. Please check your URL configuration.");
    return; // Exit without proceeding further
  }

  try {
    const response = await api.post("/send-otp", {
      phoneNumber,
      email,
      method,
      otpType,
      otpLength,
    });
    console.log("src/api/auth.js = send otp client response:", response);
    return response.data;
  } catch (error) {
    console.log("src/api/auth.js = send otp client error:", error);
    throw error.response?.data || "Error sending OTP";
  }
};

export const verifyOtp = async ({ phoneNumber, email, otp }) => {
  try {
    await validateBackendUrl();
  } catch (error) {
    console.error("URL Validation Failed:", error.message);
    alert("Unable to connect to backend. Please check your URL configuration.");
    return; // Exit without proceeding further
  }

  try {
    const response = await api.post("/verify-otp", {
      phoneNumber,
      email,
      otp,
    });
    console.log("src/api/auth.js = verify otp client response:", response);

    // If there's a token, store it in localStorage
    if (response.data?.token) {
      localStorage.setItem("authToken", response.data.token);
    }
    return response.data;
  } catch (error) {
    console.log("src/api/auth.js = verify otp client error:", error);
    throw error.response?.data || "Error verifying OTP";
  }
};

// 3) Check /me => returns user info if token is valid
export const otpAuthMe = async () => {
  try {
    // This request uses the interceptor to attach the Authorization header automatically
    const response = await api.post("/me");
    // response.data => { msg, user, userGlobal }
    return response.data;
  } catch (error) {
    throw error.response?.data || "Error verifying token via /me";
  }
};
