import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api"; // Adjust as needed

export const api = axios.create({  // ✅ Export api as a named export
  baseURL: API_BASE_URL,
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Test backend connection
export const testConnection = async () => {
  try {
    const response = await api.get("/health"); // Adjust endpoint
    console.log("✅ Backend Connected:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Backend Connection Failed:", error);
    return null;
  }
};
