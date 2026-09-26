import axios from 'axios';

export const tripoApi = axios.create({
  baseURL: "https://neuromeshstudio-g2gba3chgehkgncv.brazilsouth-01.azurewebsites.net/api",
  timeout: 50000,
  withCredentials: true
});