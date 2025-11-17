import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
});

const refreshApi = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await refreshApi.post("/refresh");
        return api(originalRequest);
      } catch (err) {
        console.log("Refresh token is dead → redirect to login");
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
