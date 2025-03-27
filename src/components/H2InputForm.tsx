import DeleteElementButton from "./DeleteElementButton";
import { EditorProps } from "../types/canvasTypes";

const H2InputForm: React.FC<EditorProps> = ({
  elementId,
  jsonGridState,
  setJsonGridState,
  gridState,
  setGridState,
  setActiveEditor,
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
        borderRadius: "4px",
      }}
    >
      <h3>&lt;h2&gt; Editor: {elementId}</h3>

      <label>
        Content:
        <textarea
          value={content}
          onChange={(e) => handleChange("content", e.target.value)}
          style={{ width: "100%", marginBottom: "0.5rem" }}
        />
      </label>

      <label>
        Styles:
        <textarea
          value={styles}
          onChange={(e) => handleChange("styles", e.target.value)}
          style={{ width: "100%" }}
        />
      </label>

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

export default H2InputForm;
