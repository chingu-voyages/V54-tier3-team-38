import { api } from "./backendService";
import { Asset  } from "../types/Asset";

export const fetchAssets = async (): Promise<Asset | null> => {
  try {
    const response = await api.get<Asset>("/api/assets/");
    console.log("✅ Assets Data Fetched:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Assets Data Fetch Failed:", error);
    return null;
  }
}