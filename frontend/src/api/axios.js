import axios from "axios";

// Central place to talk to the backend API.
// Change this URL when you deploy the backend somewhere other than localhost.
const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Automatically attach the saved login token (if any) to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
