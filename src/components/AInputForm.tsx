import React, { useState, useEffect } from "react";
import { EditorProps, DefineStyles, CELL_SIZE } from "../types/canvasTypes";
import DeleteElementButton from "./DeleteElementButton";
import { TextField } from "@mui/material";
import {
  parseStyleString,
  styleObjectToCssString,
  findCell,
  makePositionStyle,
} from "../utils";

const AInputForm: React.FC<EditorProps> = ({
  elementId,
  jsonGridState,
  setJsonGridState,
  gridState,
  setGridState,
  setActiveEditor,
  draggedElement,
  instanceCounters,
  defaultElementProps,
  saveAllStateToLocalStorage,
}) => {
  const buildAnchorContent = (href: string, text: string) =>
    `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`;

  const elementType = elementId.split(".")[0];
  const fallbackContent = defaultElementProps[elementType]?.content || "";
  const fallbackStyle = defaultElementProps[elementType]?.styles || "";

  const existingText = jsonGridState.content[elementId] || fallbackContent;
  const existingHref =
    jsonGridState.attributes[elementId]?.match(/href="(.*?)"/)?.[1] ||
    "https://www.google.com";
  const existingStyles = jsonGridState.styles[elementId] || fallbackStyle;

  const [localText, setLocalText] = useState(existingText);
  const [localHref, setLocalHref] = useState(existingHref);

  const updateAnchor = (text: string, href: string) => {
    const cell = findCell(gridState, elementId);
    const posCss = cell
      ? makePositionStyle(
          cell.row,
          cell.column,
          cell.width,
          cell.height,
          CELL_SIZE
        )
      : "";
    const userStyle = existingStyles.replace(/position:.*?;/g, "").trim();

    setJsonGridState((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        [elementId]: buildAnchorContent(href, text), // ✅ use wrapper
      },
      styles: {
        ...prev.styles,
        [elementId]: `${posCss} ${userStyle}`.trim(),
      },
      attributes: {
        ...prev.attributes,
        [elementId]: `href="${href}"`,
      },
    }));
  };

  useEffect(() => {
    updateAnchor(localText, localHref);
  }, [localText, localHref]);

  return (
    <div
      style={{
        marginBottom: "1rem",
        border: "1px solid #ccc",
        padding: "1rem",
      }}
    >
      <h3>&lt;a&gt; Editor: {elementId}</h3>
      <TextField
        label="Link Text"
        value={localText}
        onChange={(e) => setLocalText(e.target.value)}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Link Href"
        value={localHref}
        onChange={(e) => setLocalHref(e.target.value)}
        fullWidth
        margin="normal"
      />
      <DeleteElementButton
        elementId={elementId}
        gridState={gridState}
        setGridState={setGridState}
        jsonGridState={jsonGridState}
        setJsonGridState={setJsonGridState}
        setActiveEditor={setActiveEditor}
        saveAllStateToLocalStorage={saveAllStateToLocalStorage}
        draggedElement={draggedElement}
        instanceCounters={instanceCounters}
      />
    </div>
  );
};

export default AInputForm;
