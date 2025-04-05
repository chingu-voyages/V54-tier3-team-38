import React from "react";
import { SketchPicker } from "react-color";
import { MenuItem, InputLabel, FormControl, Select } from "@mui/material";

export interface StyleEditorProps {
  style: {
    backgroundColor: string;
    color: string;
    textAlign: string;
  };
  updateStyle: (
    key: "backgroundColor" | "color" | "textAlign",
    value: string
  ) => void;
}

const StyleEditor: React.FC<StyleEditorProps> = ({ style, updateStyle }) => {
  return (
    <div>
      {/* Background Color Picker */}
      <div style={{ marginTop: "1rem" }}>
        <p>Background Color</p>
        <SketchPicker
          color={style.backgroundColor}
          onChangeComplete={(color: { hex: string }) =>
            updateStyle("backgroundColor", color.hex)
          }
        />
      </div>

      {/* Text Color Picker */}
      <div style={{ marginTop: "1rem" }}>
        <p>Text Color</p>
        <SketchPicker
          color={style.color}
          onChangeComplete={(color: { hex: string }) =>
            updateStyle("color", color.hex)
          }
        />
      </div>

      {/* Alignment Picker */}
      <FormControl fullWidth style={{ marginTop: "1rem" }}>
        <InputLabel>Text Alignment</InputLabel>
        <Select
          value={style.textAlign}
          label="Text Alignment"
          onChange={(e) => updateStyle("textAlign", e.target.value as string)}
        >
          <MenuItem value="left">Left</MenuItem>
          <MenuItem value="center">Center</MenuItem>
          <MenuItem value="right">Right</MenuItem>
        </Select>
      </FormControl>
    </div>
  );
};

export default StyleEditor;
