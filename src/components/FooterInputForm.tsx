import { EditorProps } from "../types/canvasTypes"; // adjust path as needed
import DeleteElementButton from "./DeleteElementButton";

const FooterInputForm: React.FC<EditorProps> = ({
  elementId,
  jsonGridState,
  setJsonGridState,
  setActiveEditor,
  setGridState,
  gridState,
}) => {
  const content = jsonGridState.content[elementId] || "";
  const styles = jsonGridState.styles[elementId] || "";

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
      <h3>&lt;footer&gt; Editor: {elementId}</h3>

      {/* Content Field */}
      <label>
        Content:
        <textarea
          value={content}
          onChange={(e) => handleChange("content", e.target.value)}
          style={{ width: "100%", marginBottom: "0.5rem" }}
        />
      </label>

      {/* Styles Field */}
      <label>
        Styles:
        <textarea
          value={styles}
          onChange={(e) => handleChange("styles", e.target.value)}
          style={{ width: "100%" }}
        />
      </label>

      {/* Delete Button */}
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

export default FooterInputForm;
