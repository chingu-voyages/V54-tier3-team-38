import React, { useEffect, useState } from "react";
import { Canvas } from "./components/Canvas";

function App() {
  const [saveStatus, setSaveStatus] = useState<string>("");

  useEffect(() => {
    const savedStatus = localStorage.getItem("saveStatus");
    if (savedStatus) {
      setSaveStatus(savedStatus);
    }
  }, []);

  const handleSave = async () => {
    try {
      setSaveStatus("Saving...");
      // ...some logic to POST to server...
      // const response = await fetch("http://localhost:3000/generate", { ... })
      // etc.
      setSaveStatus(`✅ Saved! View at: http://localhost:3000/view/123`);
      localStorage.setItem("saveStatus", `✅ Saved!`);
    } catch (error) {
      console.error("Save error:", error);
      setSaveStatus("❌ Failed to connect to the server.");
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Grid Layout Editor</h2>
      <button onClick={handleSave}>Save Grid</button>
      {saveStatus && (
        <p
          style={{
            fontWeight: "bold",
            color: saveStatus.includes("❌") ? "red" : "green",
          }}
        >
          {saveStatus}
        </p>
      )}
      <Canvas />
    </div>
  );
}

export default App;
