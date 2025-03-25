import { api } from "./backendService";
import { SiteData  } from "@/types/SiteData";

export const fetchSiteData = async (): Promise<SiteData | null> => {
  try {
    const response = await api.get<SiteData>("/site-data");
    console.log("✅ Site Data Fetched:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Site Data Fetch Failed:", error);
    return null;
  }
}