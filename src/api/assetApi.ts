import { api } from "./backendService";
import { Asset } from "@/types/Asset";

// Fetch all assets
export const fetchAssets = async (): Promise<Asset[]> => {
  const response = await api.get<Asset[]>("/assets/");
  return response.data;
};

// Create a new asset
export const createAsset = async (assetData: Partial<Asset>): Promise<Asset> => {
  const response = await api.post<Asset>("/assets/", assetData);
  return response.data;
};

// Optionally: Update / Delete functions...
export const deleteAsset = async (assetId: number): Promise<void> => {
  await api.delete(`/assets/${assetId}`);
};