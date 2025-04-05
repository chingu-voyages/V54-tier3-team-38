import { EditorProps, DefineStyles } from "../types/canvasTypes";
import DeleteElementButton from "./DeleteElementButton";
import { TextField } from "@mui/material";
import StyleEditor from "./StyleEditor";
import { parseStyleString, styleObjectToCssString } from "../utils";
import ResetStylesButton from "./ResetStylesButton";

const ButtonInputForm: React.FC<EditorProps> = ({
  elementId,
  jsonGridState,
  setJsonGridState,
  gridState,
  setGridState,
  setActiveEditor,
  defaultElementProps,
  saveAllStateToLocalStorage,
  draggedElement,
  instanceCounters,
}) => {
  const content = jsonGridState.content[elementId] || "";

  const elementType = elementId.split(".")[0];
  const fallbackStyle = defaultElementProps[elementType]?.styles ?? "";

  const parsedStyle = parseStyleString(
    jsonGridState.styles[elementId] || fallbackStyle
  ) as DefineStyles;

  const updateStyle = (key: keyof DefineStyles, value: string) => {
    const updatedStyle = {
      ...parsedStyle,
      [key]: value,
    };

    setJsonGridState((prev) => ({
      ...prev,
      styles: {
        ...prev.styles,
        [elementId]: styleObjectToCssString(updatedStyle),
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
        saveAllStateToLocalStorage={saveAllStateToLocalStorage}
        draggedElement={draggedElement}
        instanceCounters={instanceCounters}
      />

      <ResetStylesButton
        elementId={elementId}
        jsonGridState={jsonGridState}
        setJsonGridState={setJsonGridState}
        defaultElementProps={defaultElementProps}
      />
    </div>
  );
};

export default ButtonInputForm;
