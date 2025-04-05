import React from "react";
import { EditorProps } from "../types/canvasTypes";
import DeleteElementButton from "./DeleteElementButton";
import { TextField } from "@mui/material";
import StyleEditor from "./StyleEditor";
import { parseStyleString } from "../utils";
import { DefineStyles } from "../types/canvasTypes";
import { styleObjectToCssString } from "../utils";

const ButtonInputForm: React.FC<EditorProps> = ({
  elementId,
  jsonGridState,
  setJsonGridState,
  gridState,
  setGridState,
  setActiveEditor,
  defaultElementProps,
}) => {
  const content = jsonGridState.content[elementId] || "";

  const elementType = elementId.split(".")[0];
  const fallbackStyle = defaultElementProps[elementType]?.styles ?? "";

  const parsed = parseStyleString(
    jsonGridState.styles[elementId] || fallbackStyle
  ) as Partial<DefineStyles>;
  const parsedStyle: DefineStyles = {
    backgroundColor: parsed.backgroundColor || "#ffffff",
    color: parsed.color || "#000000",
    textAlign: parsed.textAlign || "left",
  };

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
