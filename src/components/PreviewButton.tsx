import React from "react";
import { Button } from "@mui/material";
import { JSONGridState, DefineStyles } from "../types/canvasTypes"; // Adjust the import path as needed
import { parseStyleString } from "@/utils";

interface PreviewButtonProps {
  jsonGridState: JSONGridState;
}
function convertCamelToCss(style: Partial<DefineStyles>): string {
  const mappedStyle: Record<string, string> = {};

  for (const key in style) {
    const value = style[key as keyof DefineStyles];
    if (!value) continue;
    let cssKey = key;
    if (key === "backgroundColor") cssKey = "background";
    else if (key === "textAlign") cssKey = "text-align";
    else cssKey = key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);

    mappedStyle[cssKey] = value;
  }

  return Object.entries(mappedStyle)
    .map(([k, v]) => `${k}: ${v};`)
    .join(" ");
}

const PreviewButton: React.FC<PreviewButtonProps> = ({ jsonGridState }) => {
  const generateHTML = () => {
    const layout = jsonGridState.layout;
    const content = jsonGridState.content || {};
    const styles = jsonGridState.styles || {};
    const resolution = jsonGridState.resolution;

    if (!resolution || !resolution.width || !resolution.height) {
      throw new Error(
        "Missing resolution information. Please provide { width, height }."
      );
    }

    const screenWidth = resolution.width;
    const screenHeight = resolution.height;
    const numRows = layout.length;
    const numCols = layout[0].length;
    const cellHeight = Math.floor(screenHeight / numRows);
    const cellWidth = Math.floor(screenWidth / numCols);

    const tagSet = new Set<string>();
    const boundingBoxes: Record<string, any> = {};

    // First pass - bounding boxes
    for (let i = 0; i < numRows; i++) {
      for (let j = 0; j < numCols; j++) {
        const key = layout[i][j];
        if (!key) continue;

        if (!boundingBoxes[key]) {
          boundingBoxes[key] = {
            minRow: i,
            maxRow: i,
            minCol: j,
            maxCol: j,
          };
        } else {
          boundingBoxes[key].minRow = Math.min(boundingBoxes[key].minRow, i);
          boundingBoxes[key].maxRow = Math.max(boundingBoxes[key].maxRow, i);
          boundingBoxes[key].minCol = Math.min(boundingBoxes[key].minCol, j);
          boundingBoxes[key].maxCol = Math.max(boundingBoxes[key].maxCol, j);
        }
      }
    }

    const renderedKeys = new Set<string>();
    let elementsHtml = "";

    // Second pass - render elements
    for (let i = 0; i < numRows; i++) {
      for (let j = 0; j < numCols; j++) {
        const key = layout[i][j];
        const top = i * cellHeight;
        const left = j * cellWidth;

        if (!key) {
          elementsHtml += `<div style="position:absolute;top:${top}px;left:${left}px;width:${cellWidth}px;height:${cellHeight}px;"></div>`;
          continue;
        }

        if (renderedKeys.has(key)) continue;

        const box = boundingBoxes[key];
        const tag = key.split(".")[0];
        tagSet.add(tag);

        const mergedTop = box.minRow * cellHeight;
        const mergedLeft = box.minCol * cellWidth;
        const mergedWidth = (box.maxCol - box.minCol + 1) * cellWidth;
        const mergedHeight = (box.maxRow - box.minRow + 1) * cellHeight;

        const userStyle = styles[key] || "";
        const baseStyle = `position:absolute;top:${mergedTop}px;left:${mergedLeft}px;width:${mergedWidth}px;height:${mergedHeight}px;margin:0;display:block;`;
        const finalStyle =
          `${convertCamelToCss(parseStyleString(userStyle))} ${baseStyle}`.trim();

        const inner = content[key] || "";
        elementsHtml += `<${tag} style="${finalStyle}">${inner}</${tag}>`;

        renderedKeys.add(key);
      }
    }

    const tagStyleRule = Array.from(tagSet).join(", ") + " { display: block; }";

    return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview</title>
    <style>
      html, body {
        margin: 0;
        padding: 0;
        overflow: auto;
      }
      .container {
        position: relative;
        width: ${screenWidth}px;
        height: ${screenHeight}px;
      }
      ${tagStyleRule}
    </style>
  </head>
  <body>
    <div class="container">
      ${elementsHtml}
    </div>
  </body>
</html>`;
  };

  const openPreview = () => {
    try {
      const html = generateHTML();
      const previewWindow = window.open("", "_blank");
      if (previewWindow) {
        previewWindow.document.open();
        previewWindow.document.write(html);
        console.log(html);
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
