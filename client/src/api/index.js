// src/api/index.js
import axios from 'axios';

const api = axios.create({
  //baseURL: 'http://localhost:5002/api', // Update this to your backend URL // for testing locally 
  baseURL: import.meta.env.VITE_BACKEND_URL, // for testing locally ewith environment variable
  //baseURL: import.meta.env.VITE_BACKEND_LIVE_DEV_URL || import.meta.env.VITE_BACKEND_URL, // dev https with ngrok running at 5001 port 
});

console.log("src/api/index.js = requesting api client end",api)

export default api;

