import { useState, useEffect } from "react";
import { EditorProps } from "../types/canvasTypes";
import DeleteElementButton from "./DeleteElementButton";
import { TextField, Button } from "@mui/material";

function parseListItems(htmlString: string): string[] {
  const matchPattern = /<li>(.*?)<\/li>/g;
  const items: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = matchPattern.exec(htmlString)) !== null) {
    items.push(match[1]);
  }
  return items;
}

function buildUlContent(items: string[]): string {
  return items.map((item) => `<li>${item}</li>`).join("");
}

const UlInputForm: React.FC<EditorProps> = ({
  elementId,
  jsonGridState,
  setJsonGridState,
  setActiveEditor,
  gridState,
  setGridState,
  saveAllStateToLocalStorage,
  instanceCounters,
  draggedElement,
}) => {
  const originalHtml = jsonGridState.content[elementId] || "";
  const [listItems, setListItems] = useState<string[]>(() =>
    parseListItems(originalHtml)
  );
  const [styles, setStyles] = useState(
    () => jsonGridState.styles[elementId] || ""
  );

  // Whenever items or styles change, update JSON state
  useEffect(() => {
    const newHtml = buildUlContent(listItems);
    setJsonGridState((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        [elementId]: newHtml,
      },
      styles: {
        ...prev.styles,
        [elementId]: styles,
      },
    }));
  }, [listItems, styles, elementId, setJsonGridState]);

  // Handlers for adding/removing/editing list items
  const handleItemChange = (index: number, newValue: string) => {
    setListItems((prev) => {
      const clone = [...prev];
      clone[index] = newValue;
      return clone;
    });
  };

  const handleAddItem = () => {
    setListItems((prev) => [...prev, ""]);
  };

  const handleRemoveItem = (index: number) => {
    setListItems((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div
      style={{
        marginBottom: "1rem",
        border: "1px solid #ccc",
        padding: "1rem",
      }}
    >
      <h3>&lt;ul&gt; Editor: {elementId}</h3>

      {listItems.map((item, index) => (
        <div
          key={index}
          style={{
            marginBottom: "1rem",
            padding: "0.5rem",
            border: "1px solid #ddd",
            borderRadius: "4px",
          }}
        >
          <TextField
            label={`List Item #${index + 1}`}
            variant="outlined"
            value={item}
            onChange={(e) => handleItemChange(index, e.target.value)}
            fullWidth
            margin="normal"
          />
          <Button
            onClick={() => handleRemoveItem(index)}
            variant="contained"
            color="error"
          >
            Remove Item
          </Button>
        </div>
      ))}

      <Button
        onClick={handleAddItem}
        variant="contained"
        color="primary"
        style={{ marginBottom: "1rem" }}
      >
        + Add List Item
      </Button>

      <TextField
        label="Styles"
        variant="outlined"
        value={styles}
        onChange={(e) => setStyles(e.target.value)}
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
        draggedElement={draggedElement}
        instanceCounters={instanceCounters}
      />
    </div>
  );
};

export default UlInputForm;
