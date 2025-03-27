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

export const postGrid = async (name: string, description: string, grid: JSONGridState) => {
  const page = {
    name,
    description,
    data: grid
  };

  try {
    const response = await api.post("/api/page-data/", page);
    console.log("✅ Page Data Posted", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Backend Connection Failed:", error);
    throw error;
  }
}