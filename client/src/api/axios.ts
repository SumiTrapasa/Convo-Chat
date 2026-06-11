import axios from "axios";
import { message } from "antd";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL + "/api" || "http://localhost:3000/api",
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      const msg =
        error.response?.data?.message || error.message || "An error occurred";
      message.error(msg);
    } else {
      message.error("An unexpected error occurred");
    }
    return Promise.reject(error);
  },
);

export default api;
