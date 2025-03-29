import { EditorProps } from "../types/canvasTypes";
import DeleteElementButton from "./DeleteElementButton";
import { TextField } from "@mui/material";

const HeaderInputForm: React.FC<EditorProps> = ({
  elementId,
  jsonGridState,
  setJsonGridState,
  gridState,
  setGridState,
  setActiveEditor,
}) => {
  const content = jsonGridState.content[elementId] || "";
  const styles = jsonGridState.styles[elementId] || "";

  // Update content/styles in JSON grid state
  const handleChange = (field: "content" | "styles", value: string) => {
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
      <h3>&lt;h1-h6&gt; Editor: {elementId}</h3>

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

export default HeaderInputForm;
