import { useState, useEffect } from "react";
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
  saveAllStateToLocalStorage,
  instanceCounters,
  draggedElement,
}) => {
  const content = jsonGridState.content[elementId] || "";
  const styles = jsonGridState.styles[elementId] || "";
  const attributes = jsonGridState.attributes[elementId] || "";
  const [link, setLink] = useState({ href: attributes });

  // 🔁 Wrap link + content into an actual anchor tag
  useEffect(() => {
    const normalizedHref = link.href.startsWith("http")
      ? link.href
      : `https://${link.href}`;

    setJsonGridState((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        [elementId]: `<a href="${normalizedHref}" target="_blank" rel="noopener noreferrer">${content}</a>`,
      },
    }));
  }, [link.href]);

  // 🔧 Generic handler for content/styles/attributes
  const handleChange = (
    field: "content" | "styles" | "attributes",
    value: string
  ) => {
    if (field === "attributes") {
      setLink({ href: value });
    }

    setJsonGridState((prev) => ({
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
    }));
  };

  return (
    <div style={{ marginBottom: "1rem", border: "1px solid #ccc", padding: "1rem" }}>
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
        value={link.href}
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
        saveAllStateToLocalStorage={saveAllStateToLocalStorage}
        instanceCounters={instanceCounters}
        draggedElement={draggedElement}
      />
    </div>
  );
};

export default AInputForm;
