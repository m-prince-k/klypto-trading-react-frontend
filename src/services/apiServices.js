import axios from "axios";
import { toast } from "react-toastify";

// 🔹 Create axios instance
const api = axios.create({
  baseURL: "http://192.168.1.6:4000/", // change to your API
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔹 Request Interceptor (Auth, logging, etc.)
api.interceptors.request.use(
  (config) => {
    // Example: attach token
    // const token = localStorage.getItem("token");
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

// 🔹 Response Interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Something went wrong";
    // console.log("API Error:", error?.response?.data?.message);
    // console.log("API Error Details:", error?.message);
    toast.error(error?.message);

    return Promise.reject(error);
  },
);

// 🔹 API Methods
const apiService = {
  get: (url, params = {}) => api.get(url, { params }),
  post: (url, data) => api.post(url, data),
  put: (url, data) => api.put(url, data),
  patch: (url, data) => api.patch(url, data),
  delete: (url) => api.delete(url),
};

export default apiService;
