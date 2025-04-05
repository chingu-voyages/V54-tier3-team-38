import { EditorProps, DefineStyles } from "../types/canvasTypes";
import DeleteElementButton from "./DeleteElementButton";
import ResetStylesButton from "./ResetStylesButton";
import StyleEditor from "./StyleEditor";
import { TextField } from "@mui/material";
import { parseStyleString, styleObjectToCssString } from "../utils";

const BASE_STYLES = "position: static; margin: 0; padding: 0;";

const HeaderInputForm: React.FC<EditorProps> = ({
  elementId,
  jsonGridState,
  setJsonGridState,
  setActiveEditor,
  gridState,
  setGridState,
  saveAllStateToLocalStorage,
  draggedElement,
  instanceCounters,
  defaultElementProps,
}) => {
  const content = jsonGridState.content[elementId] || "";

  const elementType = elementId.split(".")[0];
  const fallback = defaultElementProps[elementType]?.styles ?? "";
  const currentStyle = jsonGridState.styles[elementId] || fallback;

  // Remove base styles temporarily so we only edit visual props
  const strippedStyle = currentStyle.replace(BASE_STYLES, "").trim();

  const parsedStyle = parseStyleString(strippedStyle) as DefineStyles;

  const updateStyle = (key: keyof DefineStyles, value: string) => {
    const updatedStyle = {
      ...parsedStyle,
      [key]: value,
    };

    const fullStyle =
      `${styleObjectToCssString(updatedStyle)} ${BASE_STYLES}`.trim();

    setJsonGridState((prev) => ({
      ...prev,
      styles: {
        ...prev.styles,
        [elementId]: fullStyle,
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
      <h3>&lt;h1–h6&gt; Editor: {elementId}</h3>

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

export default HeaderInputForm;
