// src/pages/VerifyOtp.jsx
import React, { useState } from 'react';
import { verifyOtp } from '../api/auth';
import { useLocation, useNavigate } from 'react-router-dom';

function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();
  const { phoneNumber, email, method } = location.state || {};
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!otp) {
      setError('Please enter the OTP.');
       // Capture error in Sentry
             Sentry.captureException(err);
      return;
    }

    try {
      const response = await verifyOtp({ phoneNumber, email, otp });
      setSuccess(response.msg);
      // Store JWT token (if any) and navigate to dashboard or home
      // if (response.token) {
      //   localStorage.setItem('token', response.token);
      //   navigate('/dashboard'); // Change to your desired route
      // }
      navigate('/test-management')
    } catch (err) {
      if (err.errors) {
        const messages = err.errors.map((error) => error.msg).join(', ');
        setError(messages);
         // Capture error in Sentry
               Sentry.captureException(err);
      } else {
        setError(err.msg || 'Failed to verify OTP');
         // Capture error in Sentry
               Sentry.captureException(err);
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow">
        <h1 className="text-2xl font-bold text-green-500 text-center">
          Verify OTP
        </h1>
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
            Verify OTP
          </button>
        </form>
        {error && (
          <p className="text-red-500 text-center">{error}</p>
        )}
        {success && (
          <p className="text-green-500 text-center">{success}</p>
        )}
      </div>
    </div>
  );
}

export default VerifyOtp;
