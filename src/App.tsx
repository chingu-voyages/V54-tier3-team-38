import { useEffect, useState } from "react";
import { testConnection } from "./api/backendService";
import { fetchAssets } from "./api/assetApi";
import { Asset } from "./types/asset";

function App() {
  const [siteData, setSiteData] = useState<Asset[] | null>(null);

  useEffect(() => {
    console.log("🌍 API Base URL:", import.meta.env.VITE_BASE_URL);
    
    testConnection();

    fetchAssets().then((data: Asset[]) => {
      console.log("📡 Site Data:", data);
      setSiteData(data);
    });
  }, []);
  

  return (
    <div>
      <h1>Testing API Connection</h1>
      <p>Check the console for API responses.</p>
      {siteData ? <pre>{JSON.stringify(siteData, null, 2)}</pre> : <p>Loading site data...</p>}
    </div>
  );
}

export default App;
