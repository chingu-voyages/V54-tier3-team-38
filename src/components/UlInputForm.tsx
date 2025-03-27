import React, { useState, useEffect } from "react";
import { EditorProps } from "../types/canvasTypes";
import DeleteElementButton from "./DeleteElementButton";

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
}) => {
  const originalHtml = jsonGridState.content[elementId] || "";
  const [listItems, setListItems] = useState<string[]>(() =>
    parseListItems(originalHtml)
  );

  const [styles, setStyles] = useState(
    () => jsonGridState.styles[elementId] || ""
  );
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

      {/* Render each list item as a text field */}
      {listItems.map((item, index) => (
        <div key={index} style={{ display: "flex", marginBottom: "0.5rem" }}>
          <input
            type="text"
            value={item}
            onChange={(e) => handleItemChange(index, e.target.value)}
            style={{ flex: 1, marginRight: "0.5rem" }}
          />
          <button type="button" onClick={() => handleRemoveItem(index)}>
            Remove
          </button>
        </div>
      ))}

      {/* Add item button */}
      <button
        type="button"
        onClick={handleAddItem}
        style={{ marginBottom: "1rem" }}
      >
        + Add List Item
      </button>

      {/* Styles field */}
      <label>
        <p>Styles:</p>
        <textarea
          value={styles}
          onChange={(e) => setStyles(e.target.value)}
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

export default UlInputForm;
