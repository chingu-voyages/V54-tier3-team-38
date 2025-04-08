import { useState } from "react";
import { EditorProps } from "../types/canvasTypes";
import DeleteElementButton from "./DeleteElementButton";
import { TextField } from "@mui/material";

const AInputForm: React.FC<EditorProps> = ({
  elementId,
  jsonGridState,
  setJsonGridState,
  gridState,
  setGridState,
  setActiveEditor,
}) => {
  const content = jsonGridState.content[elementId] || "";
  const styles = jsonGridState.styles[elementId] || "";
  const attributes = jsonGridState.attributes[elementId] || "";
  const [link, setLink] = useState({ href: "" });


  // Update content/styles in JSON grid state
  const handleChange = (field: "content" | "styles" | "attributes", value: string) => {
    // Only have the link attribute for the A tag, so set it 
    if (field === "attributes") {
        setLink((prev) => ({href: prev.href + value}))
    }
    setJsonGridState((prev) => {
        return ({
            ...prev,
            content: {
                ...prev.content,
                [elementId]: field === "content" ? value : prev.content[elementId],
            },
            styles: {
                ...prev.styles,
                [elementId]: field === "styles" ? value : prev.styles[elementId],
            },
            attributes: {
                ...prev.attributes,
                [elementId]: field === "attributes" ? value : prev.attributes[elementId],
            },
        })
    });
  };

  return (
    <div
      style={{
        marginBottom: "1rem",
        border: "1px solid #ccc",
        padding: "1rem",
      }}
    >
      <h3>&lt;Link&gt; Editor: {elementId}</h3>

      <TextField
        label="Content"
        variant="outlined"
        value={content}
        onChange={(e) => handleChange("content", e.target.value)}
        fullWidth
        multiline
        rows={2}
        margin="normal"
      />

    <TextField
        label="Link"
        variant="outlined"
        value={link}
        onChange={(e) => handleChange("attributes", e.target.value)}
        fullWidth
        multiline
        rows={2}
        margin="normal"
      />

      <TextField
        label="Styles"
        variant="outlined"
        value={styles}
        onChange={(e) => handleChange("styles", e.target.value)}
        fullWidth
        multiline
        rows={4}
        margin="normal"
      />

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

export default AInputForm;
