// src/components/PreviewButton.tsx
import React from "react";
import { Button } from "@mui/material";
import { JSONGridState } from "../types/canvasTypes"; // Adjust path as needed
import { generateHTMLFromJSONGrid } from "../utils"; // Adjust if your utils.ts is in the same folder

interface PreviewButtonProps {
  jsonGridState: JSONGridState;
}

const PreviewButton: React.FC<PreviewButtonProps> = ({ jsonGridState }) => {
  const openPreview = () => {
    try {
      const html = generateHTMLFromJSONGrid(jsonGridState);
      const previewWindow = window.open("", "_blank");
      if (previewWindow) {
        previewWindow.document.open();
        previewWindow.document.write(html);
        previewWindow.document.close();
      } else {
        alert("Pop-up blocked! Please allow pop-ups for this site.");
      }
    } catch (err) {
      alert((err as Error).message);
    }
  };

  return (
    <Button variant="contained" color="secondary" onClick={openPreview}>
      Preview in New Tab
    </Button>
  );
};

export default PreviewButton;
