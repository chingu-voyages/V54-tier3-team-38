import React, { useState, useEffect } from "react";
import { EditorProps, DefineStyles } from "../types/canvasTypes";
import DeleteElementButton from "./DeleteElementButton";
import StyleEditor from "./StyleEditor";
import { TextField } from "@mui/material";
import { parseStyleString, styleObjectToCssString } from "../utils";

// These base styles are locked in for layout and are removed
// before parsing user-defined styles.
const BASE_STYLES = "position: static; margin: 0; padding: 0;";

function parseAnchor(html: string): { href: string; text: string } {
  const regex = /<a\s+href=["'](.*?)["']>(.*?)<\/a>/i;
  const match = regex.exec(html);
  return match ? { href: match[1], text: match[2] } : { href: "", text: "" };
}

// UPDATED: Force the anchor to fill its container.
function buildAnchorContent(href: string, text: string): string {
  return `<a href="${href}" style="display: block; width: 100%; height: 100%;">${text}</a>`;
}

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
  // 1) Get the base type and fallback content/styles.
  const elementType = elementId.split(".")[0];
  const fallbackContent = defaultElementProps[elementType]?.content ?? "";
  const fallbackStyle = defaultElementProps[elementType]?.styles ?? "";

  // 2) Pull the existing HTML from JSON or use fallback.
  const existingHtml = jsonGridState.content[elementId] || fallbackContent;
  let { href: parsedHref, text: parsedText } = parseAnchor(existingHtml);
  if (!parsedHref && !parsedText) {
    parsedText = fallbackContent;
    parsedHref = "https://www.google.com";
  }

  // 3) Process user styles: remove the locked-in base styles.
  const existingStyles = jsonGridState.styles[elementId] || fallbackStyle;
  const strippedStyle = existingStyles.replace(BASE_STYLES, "").trim();
  const partial = parseStyleString(strippedStyle) as Partial<
    DefineStyles & {
      background?: string;
      display?: string;
      alignItems?: string;
      justifyContent?: string;
    }
  >;

  // 4) For anchors, enforce flex centering.
  const extraAnchorStyle =
    elementType === "a"
      ? {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }
      : {};

  // 5) Merge the parsed styles with defaults and extra centering.
  //    We cast textAlign to a string to satisfy TypeScript.
  const rawMerged = {
    backgroundColor: partial.backgroundColor || partial.background || "#ffffff",
    color: partial.color || "#0000ff",
    textAlign: (partial.textAlign ?? "left") as string,
    ...extraAnchorStyle,
  };
  const mergedStyle = rawMerged as DefineStyles;

  // 6) Local state for the anchor's text and href.
  const [localText, setLocalText] = useState(parsedText);
  const [localHref, setLocalHref] = useState(parsedHref);

  // 7) Function to update styles in JSON state,
  // always merging in the extra anchor style.
  const updateStyle = (key: keyof DefineStyles, value: string) => {
    const newRaw = {
      ...rawMerged,
      [key]: key === "textAlign" ? (value as string) : value,
      ...extraAnchorStyle,
    };
    const newStyle = newRaw as DefineStyles;
    const fullStyle =
      `${styleObjectToCssString(newStyle)} ${BASE_STYLES}`.trim();
    setJsonGridState((prev) => ({
      ...prev,
      styles: {
        ...prev.styles,
        [elementId]: fullStyle,
      },
    }));
  };

  // 8) Update the anchor HTML in the JSON state.
  const updateAnchor = (newText: string, newHref: string) => {
    const newHtml = buildAnchorContent(newHref, newText);
    setJsonGridState((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        [elementId]: newHtml,
      },
    }));
  };

  // 9) Whenever local text or href changes, update JSON.
  useEffect(() => {
    updateAnchor(localText, localHref);
  }, [localText, localHref]);

  // 10) On mount or when elementId changes, force an update of styles.
  useEffect(() => {
    if (elementType === "a") {
      updateStyle("textAlign", mergedStyle.textAlign);
    }
  }, [elementId, elementType, mergedStyle.textAlign]);

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
        variant="outlined"
        value={localText}
        onChange={(e) => setLocalText(e.target.value)}
        fullWidth
        margin="normal"
      />

      <TextField
        label="Link Href"
        variant="outlined"
        value={localHref}
        onChange={(e) => setLocalHref(e.target.value)}
        fullWidth
        margin="normal"
      />

      {/* <StyleEditor style={mergedStyle} updateStyle={updateStyle} /> */}

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
