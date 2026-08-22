import axios from 'axios';
import Cookies from 'js-cookie';

export const tripoApi = axios.create({
  baseURL: "https://localhost:7103/api",
  timeout: 20000,
});

tripoApi.interceptors.request.use((config) => {
  const token = Cookies.get("access-token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});