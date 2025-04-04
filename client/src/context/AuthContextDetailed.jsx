// src/contexts/AuthContext.js
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
} from "react";
import axios from "axios";

const AuthContextDetailed = createContext();

export const AuthProviderDetailed = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // loading for reauth
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const intervalRef = useRef(null);

  // Called after a successful OTP login or Google login
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

  //  Attempt to validate an existing token on app load
  const checkToken = async () => {
    setLoading(true);
    setElapsedSeconds(0);

    // Start incrementing elapsed time every second
    intervalRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    const savedToken = localStorage.getItem("token");
    if (!savedToken) {
      // no token and thus not logged in
      setLoading(false);
      clearInterval(intervalRef.current);
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost:5050/fms/api/v0/otp-auth/me",
        {},
        {
          headers: { Authorization: `Bearer ${savedToken}` },
          // withCredentials: true, // ADDED only if your backend needs cookies
        }
      );
      if (response.data && response.data.user) {
        setIsAuthenticated(true);
        setToken(savedToken);
        setUser(response.data.user);
        console.log("line 67 user ", response.data.user);
      } else {
        console.log("response.data was not able to find ", response);
        logout();
      }
    } catch (err) {
      // token is invalid or request failed
      console.error("Check token error:", err.response?.data || err.message);
      logout();
    }
    setLoading(false);
    clearInterval(intervalRef.current);
  };

  useEffect(() => {
    // On mount, try to validate existing token
    checkToken();
    // eslint-disable-next-line
    // Cleanup the interval on unmount
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <AuthContextDetailed.Provider
      value={{
        isAuthenticated,
        token,
        checkToken,
        user,
        login,
        logout,
        loading,
        elapsedSeconds,
      }}
    >
      {children}
    </AuthContextDetailed.Provider>
  );
};

export const useAuthDetailed = () => useContext(AuthContextDetailed);
