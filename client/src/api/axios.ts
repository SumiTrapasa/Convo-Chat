import axios from "axios";
import { message } from "antd";
import { BASE_URL } from "@/const/config";

const api = axios.create({
  baseURL: BASE_URL + "/api",
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      const isUnauthorized = error.response?.status === 401;
      if (!isUnauthorized) {
        const msg =
          error.response?.data?.message || error.message || "An error occurred";
        message.error(msg);
      }
    } else {
      message.error("An unexpected error occurred");
    }
    return Promise.reject(error);
  },
);

export default api;
