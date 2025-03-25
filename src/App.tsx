import { useEffect, useState } from "react";
import { fetchSiteData } from "./api/siteDataApi";
import { SiteData } from "./types/siteData";
import TestConnection from "./components/TestConnection"; // 👈 import the new component
import { Canvas } from "./components/Canvas";
function App() {
  const [siteData, setSiteData] = useState<SiteData | null>(null);
  const [viewCanvas, setViewCanvas] = useState<boolean>(false);

  useEffect(() => {
    fetchSiteData().then((data) => {
      console.log("📡 Site Data:", data);
      setSiteData(data);
    });
  }, []);

  return (
    <>
      <button
        onClick={() => {
          setViewCanvas((prev) => !prev);
        }}
      >
        {`Click Here to View the ${viewCanvas ? "api test" : "canvas"}`}
      </button>
      {viewCanvas ? (
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
      ) : (
        <div style={{ padding: "1rem" }}>
          <h2>Grid Layout Editor</h2>

          <Canvas />
        </div>
      )}
      );
    </>
  );
}

export default App;
