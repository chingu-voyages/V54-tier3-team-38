import { useEffect, useState } from "react";
import { fetchAssets } from "./api/assetApi";
import { Asset } from "@/types/asset";
import TestConnection from "./components/TestConnection"; //
import { Canvas } from "./components/Canvas";
import PreviewAsset from "./components/PreviewAsset";
import CreateAsset from "./components/CreateAsset"; //
import PageList from "./components/PageList";

function App() {
  const [viewCanvas, setViewCanvas] = useState<boolean>(false);
  const [assetData, setAssetData] = useState<Asset[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const assets = await fetchAssets();
      setAssetData(assets);
    };
    fetchData();
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
        <div style={{ padding: "1rem" }}>
          <h2>Grid Layout Editor</h2>
          <Canvas />
        </div>
      ) : (
        <div>
          <PageList />
          <h1>Testing API Connection</h1>
          <PreviewAsset />
          <CreateAsset />
          <p>Check the console for API responses.</p>
          {assetData ? (
            <pre>{JSON.stringify(assetData, null, 2)}</pre>
          ) : (
            <p>Loading site data...</p>
          )}
        </div>
      )}
    </>
  );
}

export default App;
