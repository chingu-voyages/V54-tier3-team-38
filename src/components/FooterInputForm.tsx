import { EditorProps, DefineStyles } from "../types/canvasTypes";
import DeleteElementButton from "./DeleteElementButton";
import ResetStylesButton from "./ResetStylesButton";
import StyleEditor from "./StyleEditor";
import { TextField } from "@mui/material";
import { parseStyleString, styleObjectToCssString } from "../utils";

const FooterInputForm: React.FC<EditorProps> = ({
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
  const elementType = elementId.split(".")[0];
  const fallbackContent = defaultElementProps[elementType]?.content ?? "";
  const fallbackStyle = defaultElementProps[elementType]?.styles ?? "";

  const content = jsonGridState.content[elementId] || fallbackContent;

  const parsed = parseStyleString(
    jsonGridState.styles[elementId] || fallbackStyle
  ) as Partial<DefineStyles>;

  const parsedStyle: DefineStyles = {
    backgroundColor: parsed.backgroundColor || "#000000",
    color: parsed.color || "#cccccc",
    textAlign: parsed.textAlign || "center",
  };

  const updateStyle = (key: keyof DefineStyles, value: string) => {
    const newStyle: DefineStyles = {
      ...parsedStyle,
      [key]: value,
    };
    setJsonGridState((prev) => ({
      ...prev,
      styles: {
        ...prev.styles,
        [elementId]: styleObjectToCssString(newStyle),
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

export default FooterInputForm;
