// src/context/AuthContext.jsx

import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

/**
 * AuthProviderTest:
 *  - Single context for both OTP-based logins and Google-based logins
 *  - Maintains user and token state, plus methods for login, sign-out, etc.
 */
export const AuthProviderTest = ({ children }) => {
  // Global auth states
  const [user, setUser] = useState(null); // user object (e.g., { email, ... })
  const [token, setToken] = useState(null); // JWT token
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // indicates if we're checking token on mount

  // ------------------------------------------------------------------------------
  // 1) Shared method: store token & user and mark isAuthenticated=true
  // ------------------------------------------------------------------------------
  const saveTokenAndUser = (tokenValue, userValue) => {
    setToken(tokenValue);
    setUser(userValue);
    setIsAuthenticated(true);
    localStorage.setItem("authToken", tokenValue);
  };

  // ------------------------------------------------------------------------------
  // 2) OTP Flow
  // ------------------------------------------------------------------------------

  /**
   * sendOtp
   *  - Request the backend to generate and send an OTP (via email, SMS, or WhatsApp).
   *  - The backend doesn't return a token here; it just sends the OTP externally.
   *  - Typically, the user then calls verifyOtp after receiving the OTP.
   */
  //   const sendOtp = async ({ phoneNumber, email, method }) => {
  //     await axios.post("http://localhost:5050/otp-auth/send-otp", {
  //       phoneNumber,
  //       email,
  //       method,
  //     });
  //   };

  /**
   * verifyOtp
   *  - Provide the OTP to the backend for verification.
   *  - On success, the backend returns a JWT token and possibly user data.
   */
  //   const verifyOtp = async ({ phoneNumber, email, otp }) => {
  //     const response = await axios.post(
  //       "http://localhost:5050/otp-auth/verify-otp",
  //       {
  //         phoneNumber,
  //         email,
  //         otp,
  //       }
  //     );

  //     // Suppose server returns an object like { token, msg, user }.
  //     if (response.data.token) {
  //       const { token: newToken, user: userFromServer } = response.data;

  //       // If your backend only returns a token, no user, you might do:
  //       // const userValue = { email, phoneNumber };
  //       // or call /me to get the user details.

  //       if (userFromServer) {
  //         saveTokenAndUser(newToken, userFromServer);
  //       } else {
  //         // fallback if server didn't return user
  //         // we can store at least the phone/email in user
  //         saveTokenAndUser(newToken, { email, phoneNumber });
  //       }
  //     }
  //   };

  // ------------------------------------------------------------------------------
  // 3) Google Flow
  // ------------------------------------------------------------------------------

  /**
   * redirectToGoogle
   *  - Kicks off the Google OAuth flow by navigating to your backend's Google route.
   *  - The backend will handle Google sign-in, then redirect to a callback in your front-end.
   */
  const redirectToGoogle = () => {
    window.location.href = "http://localhost:5050/auth/google";
  };

  /**
   * handleGoogleCallback
   *  - Called in your front-end route after the backend redirects with a token & user info.
   *  - We store them in the same place as OTP login, marking isAuthenticated=true.
   */
  const handleGoogleCallback = (tokenValue, googleUser) => {
    saveTokenAndUser(tokenValue, googleUser);
  };

  // ------------------------------------------------------------------------------
  // 4) Common Sign-Out
  // ------------------------------------------------------------------------------
  const signOut = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem("authToken");
  };

  // ------------------------------------------------------------------------------
  // 5) Check Token on Mount (restoring session)
  // ------------------------------------------------------------------------------
  const checkToken = async () => {
    const savedToken = localStorage.getItem("authToken");
    if (!savedToken) {
      // No token => not logged in
      setLoading(false);
      return;
    }

    try {
      // Verify the token by calling /me or a similar endpoint
      const resp = await axios.post(
        "http://localhost:5050/fms/api/v0/otp-auth/me",
        {},
        { headers: { Authorization: `Bearer ${savedToken}` } }
      );

      // Suppose the server responds with { user } if token is valid
      if (resp.data?.user) {
        setUser(resp.data.user);
        setToken(savedToken);
        setIsAuthenticated(true);
      } else {
        signOut();
      }
    } catch (err) {
      console.error("Error checking token", err.response?.data || err.message);
      signOut();
    }

    setLoading(false);
  };

  // ------------------------------------------------------------------------------
  // 6) useEffect => check token once on mount
  // ------------------------------------------------------------------------------
  useEffect(() => {
    checkToken();
  }, []);

  // ------------------------------------------------------------------------------
  // 7) Return the Context Provider
  // ------------------------------------------------------------------------------
  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,

        // OTP flows
        sendOtp,
        verifyOtp,

        // Google flows
        redirectToGoogle,
        handleGoogleCallback,

        // sign-out
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthTest = () => useContext(AuthContext);
