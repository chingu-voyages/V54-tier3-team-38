import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_BASE_URL; // if local will use .env, if production will use .env.development

export const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});
