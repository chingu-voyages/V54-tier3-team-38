import { api } from "./client";
import { Asset } from "@/types/asset";

// Create a new asset
export const createAsset = async (assetData: FormData): Promise<Asset> => {
  const response = await api.post<Asset>("/assets/", assetData);
  return response.data;
};

// Optionally: Update / Delete functions...
export const deleteAsset = async (assetId: number): Promise<void> => {
  await api.delete(`/assets/${assetId}`);
};

export const fetchAssets = async (): Promise<Asset[]> => {
  try {
    const response = await api.get<Asset[]>("/api/assets/");
    console.log("✅ Assets Data Fetched:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Assets Data Fetch Failed:", error);
    return []; // Return an empty array if there's an error
  }
};