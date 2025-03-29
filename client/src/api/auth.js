// src/api/auth.js
import api from './index';
import validateBackendUrl from './validate-url';

export const sendOtp = async ({ phoneNumber, email, method, otpType, otpLength }) => {
  
  console.log("src/api/auth.js = endOtp Payload:",  {phoneNumber, email, method, otpType, otpLength }); // Debug
  // console.log('VITE_PORT:', process.env.VITE_PORT);
  try {
    await validateBackendUrl();
  } catch (error) {
    console.error("URL Validation Failed:", error.message);
    alert('Unable to connect to backend. Please check your URL configuration.');
    return; // Exit without proceeding further
  }

  try {
    const response = await api.post('/auth/send-otp', { phoneNumber, email, method, otpType, otpLength });
    console.log("src/api/auth.js = send otp client response:", response);
    return response.data;
  } catch (error) {
    console.log("src/api/auth.js = send otp client error:", error);
    throw error.response?.data || 'Error sending OTP';
  }
};

export const verifyOtp = async ({ phoneNumber, email, otp }) => {
   try {
    await validateBackendUrl();
  } catch (error) {
    console.error("URL Validation Failed:", error.message);
    alert('Unable to connect to backend. Please check your URL configuration.');
    return; // Exit without proceeding further
  }
  
  try {
    const response = await api.post('/auth/verify-otp', { phoneNumber, email, otp });
    console.log("src/api/auth.js = verify otp client response:", response);
    return response.data;
  } catch (error) {
    console.log("src/api/auth.js = verify otp client error:", error);
    throw error.response?.data || 'Error verifying OTP';
  }
};
