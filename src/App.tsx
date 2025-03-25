import { useEffect, useState } from "react";
import { fetchSiteData } from "./api/siteDataApi";
import { SiteData } from "./types/SiteData";
import TestConnection from "./components/TestConnection"; // 👈 import the new component

function App() {
  const [siteData, setSiteData] = useState<SiteData | null>(null);

  useEffect(() => {
    fetchSiteData().then((data) => {
      console.log("📡 Site Data:", data);
      setSiteData(data);
    });
  }, []);

  return (
    <div>
      <h1>Testing API Connection</h1>
      <TestConnection /> {/* 👈 background API ping */}
      <p>Check the console for API responses.</p>
      {siteData ? (
        <pre>{JSON.stringify(siteData, null, 2)}</pre>
      ) : (
        <p>Loading site data...</p>
      )}
    </div>
  );
}

export default App;
