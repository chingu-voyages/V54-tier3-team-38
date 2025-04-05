import React from "react";
import { EditorProps } from "../types/canvasTypes";
import DeleteElementButton from "./DeleteElementButton";
import { TextField } from "@mui/material";
import StyleEditor from "./StyleEditor";
import { parseStyleString } from "../utils";
import { DefineStyles } from "../types/canvasTypes";
import { styleObjectToCssString } from "../utils";

// Helper to convert a style object to a CSS string.

const ButtonInputForm: React.FC<EditorProps> = ({
  elementId,
  jsonGridState,
  setJsonGridState,
  gridState,
  setGridState,
  setActiveEditor,
}) => {
  const content = jsonGridState.content[elementId] || "";

  const defaultStyle: DefineStyles = {
    backgroundColor: "#ffffff",
    color: "#000000",
    textAlign: "left",
  };

  let parsedStyle: DefineStyles = defaultStyle;
  try {
    const rawStyle = jsonGridState.styles[elementId];
    if (rawStyle) {
      const parsed = parseStyleString(rawStyle) as Partial<DefineStyles>;
      parsedStyle = {
        backgroundColor: parsed.backgroundColor || defaultStyle.backgroundColor,
        color: parsed.color || defaultStyle.color,
        textAlign: parsed.textAlign || defaultStyle.textAlign,
      };
    }
  } catch (err) {
    console.warn("Invalid style string:", jsonGridState.styles[elementId]);
  }

  const updateStyle = (key: keyof DefineStyles, value: string) => {
    const newStyle: DefineStyles = {
      ...parsedStyle,
      [key]: value,
    };
    setJsonGridState((prev) => ({
      ...prev,
      styles: {
        ...prev.styles,
        [elementId]: styleObjectToCssString(newStyle),
      },
    }));
  };

  return (
    <div
      style={{
        marginBottom: "1rem",
        border: "1px solid #ccc",
        padding: "1rem",
      }}
    >
      <h3>&lt;Button&gt; Editor: {elementId}</h3>

      <TextField
        label="Content"
        variant="outlined"
        value={content}
        onChange={(e) =>
          setJsonGridState((prev) => ({
            ...prev,
            content: {
              ...prev.content,
              [elementId]: e.target.value,
            },
          }))
        }
        fullWidth
        multiline
        rows={2}
        margin="normal"
      />

      {/* Using the extracted StyleEditor component */}
      <StyleEditor style={parsedStyle} updateStyle={updateStyle} />

      <DeleteElementButton
        elementId={elementId}
        gridState={gridState}
        setGridState={setGridState}
        jsonGridState={jsonGridState}
        setJsonGridState={setJsonGridState}
        setActiveEditor={setActiveEditor}
      />
    </div>
  );
};

export default ButtonInputForm;
