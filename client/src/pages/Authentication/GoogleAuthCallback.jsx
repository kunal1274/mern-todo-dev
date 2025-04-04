// src/pages/Authentication/GoogleAuthCallback.jsx
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
// import { useAuth } from "../contexts/AuthContext";
import { useAuthDetailed } from "../../context/AuthContextDetailed";

const GoogleAuthCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuthDetailed();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");
    const email = queryParams.get("email");
    const error = queryParams.get("error");

    if (error) {
      // If there's an error param, handle or redirect
      navigate("/", { state: { error: "Google Auth failed" } });
      return;
    }

    console.log("token at line 24", token);
    if (token) {
      // Use your existing AuthContext login to store this token
      login({ token, email });
      navigate("/dashboard");
    } else {
      // If no token, redirect to login
      navigate("/", { state: { error: "No token found from Google Auth" } });
    }
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Processing Google login...</p>
    </div>
  );
};

export default GoogleAuthCallback;
