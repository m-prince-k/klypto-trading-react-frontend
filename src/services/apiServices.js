import axios from "axios";
import { toast } from "react-toastify";


const token = localStorage.getItem("session") && JSON.parse(localStorage.getItem("session"));

// 🔹 Create axios instance
const api = axios.create({
  baseURL: "http://192.168.1.10:4000/", // change to your API
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
api.interceptors.response.use((response) => response?.data,(error) => {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Something went wrong";
    // console.log("API Error:", error?.response?.data?.message);
    // console.log("API Error Details:", error?.message);


    return Promise.reject(error);
  },
);

// 🔹 API Methods
const authHeaders = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
};

const apiService = {
  get: (url, params = {}) =>
    api.get(url, {
      headers: authHeaders,
      params,
    }),

  post: (url, data = {}) =>
    api.post(url, data, {
      headers: authHeaders,
    }),

  put: (url, data = {}) =>
    api.put(url, data, {
      headers: authHeaders,
    }),

  patch: (url, data = {}) =>
    api.patch(url, data, {
      headers: authHeaders,
    }),

  delete: (url) =>
    api.delete(url, {
      headers: authHeaders,
    }),
};

export default apiService;
