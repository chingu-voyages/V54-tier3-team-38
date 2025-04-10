import React, { useState, useEffect } from "react";
import { EditorProps, DefineStyles } from "../types/canvasTypes";
import DeleteElementButton from "./DeleteElementButton";

import StyleEditor from "./StyleEditor";
import { TextField } from "@mui/material";
import { parseStyleString, styleObjectToCssString } from "../utils";

// These styles are “locked in” to help with layout.
const BASE_STYLES = "position: static; margin: 0; padding: 0;";

function parseAnchor(html: string): { href: string; text: string } {
  const regex = /<a\s+href=["'](.*?)["']>(.*?)<\/a>/i;
  const match = regex.exec(html);
  return match ? { href: match[1], text: match[2] } : { href: "", text: "" };
}

// Create an <a> tag with the given href and text.
function buildAnchorContent(href: string, text: string): string {
  return `<a href="${href}">${text}</a>`;
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
  const elementType = elementId.split(".")[0];
  const fallbackContent = defaultElementProps[elementType]?.content ?? "";
  const fallbackStyle = defaultElementProps[elementType]?.styles ?? "";
  const existingHtml = jsonGridState.content[elementId] || fallbackContent;
  let { href: parsedHref, text: parsedText } = parseAnchor(existingHtml);

  if (!parsedHref && !parsedText) {
    parsedText = fallbackContent;
    parsedHref = "https://www.google.com";
  }

  // Process styles by removing locked-in base styles.
  const existingStyles = jsonGridState.styles[elementId] || fallbackStyle;
  const strippedStyle = existingStyles.replace(BASE_STYLES, "").trim();

  const partial = parseStyleString(strippedStyle) as Partial<
    DefineStyles & { background?: string }
  >;
  const mergedStyle: DefineStyles = {
    backgroundColor: partial.backgroundColor || partial.background || "#ffffff",
    color: partial.color || "#0000ff",
    textAlign: partial.textAlign || "left",
  };

  // Local state for link text and href.
  const [localText, setLocalText] = useState(parsedText);
  const [localHref, setLocalHref] = useState(parsedHref);

  // Update style value.
  const updateStyle = (key: keyof DefineStyles, value: string) => {
    const newStyle: DefineStyles = {
      ...mergedStyle,
      [key]: value,
    };
    // Add back the locked-in base styles.
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

  // Update the anchor HTML content.
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

      <StyleEditor style={mergedStyle} updateStyle={updateStyle} />

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
