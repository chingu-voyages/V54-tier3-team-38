import React from "react";

interface ElementData {
  content: string;
  styles: string;
  defaultWidth: number;
  defaultHeight: number;
}

interface Props {
  elementKey: string;
  values: ElementData;
  onChange: (key: string, updated: ElementData) => void;
}

const ElementEditor: React.FC<Props> = ({ elementKey, values, onChange }) => {
  const handleChange = (field: keyof ElementData, value: string | number) => {
    onChange(elementKey, { ...values, [field]: value });
  };

  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "1rem",
        marginBottom: "1rem",
      }}
    >
      <h3>Edit: {elementKey}</h3>

      <label>
        Content:
        <textarea
          value={values.content}
          onChange={(e) => handleChange("content", e.target.value)}
          style={{ width: "100%", marginBottom: "0.5rem" }}
        />
      </label>

      <label>
        Styles:
        <textarea
          value={values.styles}
          onChange={(e) => handleChange("styles", e.target.value)}
          style={{ width: "100%", marginBottom: "0.5rem" }}
        />
      </label>

      <label>
        Width:
        <input
          type="number"
          value={values.defaultWidth}
          onChange={(e) => handleChange("defaultWidth", Number(e.target.value))}
          style={{ width: "100%", marginBottom: "0.5rem" }}
        />
      </label>

      <label>
        Height:
        <input
          type="number"
          value={values.defaultHeight}
          onChange={(e) =>
            handleChange("defaultHeight", Number(e.target.value))
          }
          style={{ width: "100%" }}
        />
      </label>
    </div>
  );
};

export default ElementEditor;
