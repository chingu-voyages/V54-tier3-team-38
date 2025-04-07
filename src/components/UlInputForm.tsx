import { EditorProps, DefineStyles } from "../types/canvasTypes";
import DeleteElementButton from "./DeleteElementButton";
import ResetStylesButton from "./ResetStylesButton";
import StyleEditor from "./StyleEditor";
import { TextField, Button } from "@mui/material";
import { parseStyleString, styleObjectToCssString } from "../utils";

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
  defaultElementProps,
}) => {
  const elementType = elementId.split(".")[0];
  const fallbackContent = defaultElementProps[elementType]?.content ?? "";
  const fallbackStyle = defaultElementProps[elementType]?.styles ?? "";

  const content = jsonGridState.content[elementId] || fallbackContent;
  const listItems = parseListItems(content);

  const parsed = parseStyleString(
    jsonGridState.styles[elementId] || fallbackStyle
  ) as Partial<DefineStyles>;

  const parsedStyle: DefineStyles = {
    backgroundColor: parsed.backgroundColor || "#ffffff",
    color: parsed.color || "#000000",
    textAlign: parsed.textAlign || "left",
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

  const updateListItems = (items: string[]) => {
    const newHtml = buildUlContent(items);
    setJsonGridState((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        [elementId]: newHtml,
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
            onChange={(e) => {
              const updated = [...listItems];
              updated[index] = e.target.value;
              updateListItems(updated);
            }}
            fullWidth
            margin="normal"
          />
          <Button
            onClick={() => {
              const updated = listItems.filter((_, i) => i !== index);
              updateListItems(updated);
            }}
            variant="contained"
            color="error"
          >
            Remove Item
          </Button>
        </div>
      ))}

      <Button
        onClick={() => updateListItems([...listItems, ""])}
        variant="contained"
        color="primary"
        style={{ marginBottom: "1rem" }}
      >
        + Add List Item
      </Button>

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

export default UlInputForm;
