import axios from 'axios';
import Cookies from 'js-cookie';

export const tripoApi = axios.create({
  baseURL: "https://neuromeshstudio-g2gba3chgehkgncv.brazilsouth-01.azurewebsites.net/api",
  timeout: 20000,
});

tripoApi.interceptors.request.use((config) => {
  const token = Cookies.get("access-token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});