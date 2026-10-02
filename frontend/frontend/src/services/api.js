//axios என்பது frontend-லிருந்து backend API-க்கு HTTP request அனுப்ப use பண்ணுற library. 
import axios from "axios";

// “நம்ம frontend API request எல்லாம் இந்த backend address-க்கு அனுப்பு”
const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;