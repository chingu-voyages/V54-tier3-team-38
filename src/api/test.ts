import { api } from "./client";

// Test backend connection
export const testConnection = async () => {
  try {
    const response = await api.get("/api/health"); // Adjust endpoint
    console.log("✅ Backend Connected:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Backend Connection Failed:", error);
    return null;
  }
};
