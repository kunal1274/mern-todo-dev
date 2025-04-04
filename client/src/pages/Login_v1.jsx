// src/pages/Login.jsx
import React, { useState } from 'react';
import { sendOtp } from '../api/auth';
import { verifyOtp } from '../api/auth';
import { useNavigate } from 'react-router-dom';
// import * as Sentry from '@sentry/react';

function Login() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [method, setMethod] = useState('email'); // Default method
  const [otpType, setOtpType] = useState('numeric'); // Default OTP type
  const [otpLength, setOtpLength] = useState(6); // Default OTP length
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // src/pages/Login.jsx
// ... existing imports and component code

const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    console.log("Submitting Data:", {
      phoneNumber,
      email,
      method,
      otpType,
      otpLength,
    });
  
    // Input Validation
    if (!phoneNumber && !email) {
      setError('Please provide either a phone number or an email.');
      return;
    }
  
    if (!['whatsapp', 'sms', 'email'].includes(method)) {
      setError('Invalid method selected.');
      return;
    }
  
    try {
      await sendOtp({ phoneNumber, email, method, otpType, otpLength });
      // Navigate to OTP Verification Page, passing necessary data
      navigate('/verify-otp', { state: { phoneNumber, email, method } });
    } catch (err) {
      setError(err.msg || `Failed to send OTP ${err.msg}`);
       // Capture error in Sentry
       //Sentry.captureException(err);
    }
  };
  
  // ... rest of the component
  

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow">
        <h1 className="text-2xl font-bold text-blue-500 text-center">
          Login / Signup
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Phone Number Input */}
          <input
            type="tel"
            pattern="[0-9]{10}"
            value={phoneNumber}
            onChange={(e) => {
              console.log("Phone Number Input:", e.target.value); 
              setPhoneNumber(e.target.value)}}
            placeholder="Enter your mobile number"
            className="w-full px-3 py-2 border rounded"
            disabled={method === 'email'} // Disable if email method is selected
          />

          {/* Email Input */}
          <input
            type="email"
            value={email}
            onChange={(e) => {
              console.log("email input ",e.target.value)
              setEmail(e.target.value)}}
            placeholder="Enter your Email Address"
            className="w-full px-3 py-2 border rounded"
            disabled={method !== 'email'} // Disable unless email method is selected
          />

          {/* Method Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Send OTP via:</label>
            <div className="flex items-center space-x-4 mt-2">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="method"
                  value="whatsapp"
                  checked={method === 'whatsapp'}
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
                  checked={method === 'sms'}
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
                  checked={method === 'email'}
                  onChange={(e) => setMethod(e.target.value)}
                  className="form-radio"
                />
                <span className="ml-2">Email</span>
              </label>
            </div>
          </div>

          {/* OTP Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700">OTP Type:</label>
            <select
              value={otpType}
              onChange={(e) => setOtpType(e.target.value)}
              className="w-full px-3 py-2 border rounded mt-2"
            >
              <option value="numeric">Numeric</option>
              <option value="alphanumeric">Alphanumeric</option>
              <option value="alphanumeric_special">Alphanumeric with Special Characters</option>
            </select>
          </div>

          {/* OTP Length Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700">OTP Length:</label>
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
            className="w-full px-3 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 transition duration-300"
          >
            Send OTP via {`${method === "email" ? "Email" : method === "sms" ? "SMS" : "WhatsApp"}`}
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <p className="text-red-500 text-center">{error}</p>
        )}
      </div>
    </div>
  );
}

export default Login;
