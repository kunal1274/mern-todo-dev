// src/context/AuthContextDetailed.js
import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const AuthContextDetailed = createContext();

export const AuthProviderDetailed = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  // If we are checking the token on mount, we show a spinner until done
  const [loading, setLoading] = useState(true);
  const [reloading, setIsReloading] = useState(false);

  // We’ll measure how long the re-auth took, but only once
  const [checkTimeMs, setCheckTimeMs] = useState(0);

  // Called after a successful OTP or Google login
  const login = ({ token, email, phoneNumber }) => {
    setIsAuthenticated(true);
    setToken(token);
    setUser({ email, phoneNumber });
    localStorage.setItem("token", token);
  };

  // Called to log out
  const logout = () => {
    setIsAuthenticated(false);
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
  };

  // Attempt to validate an existing token on app load
  const checkToken = async () => {
    setLoading(true);

    // Start a time measurement
    const startTime = performance.now();

    const savedToken = localStorage.getItem("token");
    if (!savedToken) {
      // no token => user is not logged in
      setLoading(false);
      return;
    }

    try {
      // pass an EMPTY body as 2nd param, and HEADERS as 3rd param
      const response = await axios.post(
        "http://localhost:5050/fms/api/v0/otp-auth/me",
        {},
        {
          headers: { Authorization: `Bearer ${savedToken}` },
          // withCredentials: true,  // only if you rely on cookies
        }
      );

      if (response.data && response.data.user) {
        setIsAuthenticated(true);
        setToken(savedToken);
        setUser(response.data.user);
      } else {
        // no user => logout
        logout();
      }
    } catch (err) {
      console.error("checkToken error:", err.response?.data || err.message);
      // error => logout
      logout();
    }

    // Save how long it took
    const endTime = performance.now();
    setCheckTimeMs(endTime - startTime);

    // done loading
    setLoading(false);
  };

  // On mount, run checkToken exactly once
  useEffect(() => {
    checkToken();
  }, [reloading]);

  return (
    <AuthContextDetailed.Provider
      value={{
        isAuthenticated,
        reloading,
        setIsReloading,
        token,
        user,
        login,
        logout,
        loading,
        checkTimeMs,
      }}
    >
      {children}
    </AuthContextDetailed.Provider>
  );
};

export const useAuthDetailed = () => useContext(AuthContextDetailed);
