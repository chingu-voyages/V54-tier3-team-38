import { EditorProps, DefineStyles } from "../types/canvasTypes";
import DeleteElementButton from "./DeleteElementButton";
import ResetStylesButton from "./ResetStylesButton";
import StyleEditor from "./StyleEditor";
import { TextField, Button } from "@mui/material";
import { parseStyleString, styleObjectToCssString } from "../utils";

function parseNavLinks(html: string): Array<{ url: string; text: string }> {
  const anchorRegex = /<a\s+href=["'](.*?)["']>(.*?)<\/a>/gi;
  const links: { url: string; text: string }[] = [];
  let match: RegExpExecArray | null;

  while ((match = anchorRegex.exec(html)) !== null) {
    links.push({
      url: match[1],
      text: match[2],
    });
  }
  return links;
}

function buildNavContent(links: Array<{ url: string; text: string }>): string {
  return links
    .map((link) => `<a href="${link.url}">${link.text}</a>`)
    .join(" | ");
}

const NavInputForm: React.FC<EditorProps> = ({
  elementId,
  jsonGridState,
  setJsonGridState,
  setGridState,
  gridState,
  setActiveEditor,
  saveAllStateToLocalStorage,
  draggedElement,
  instanceCounters,
  defaultElementProps,
}) => {
  const elementType = elementId.split(".")[0];
  const fallbackContent = defaultElementProps[elementType]?.content ?? "";
  const fallbackStyle = defaultElementProps[elementType]?.styles ?? "";

  const content = jsonGridState.content[elementId] || fallbackContent;
  const links = parseNavLinks(content);

  const parsed = parseStyleString(
    jsonGridState.styles[elementId] || fallbackStyle
  ) as Partial<DefineStyles>;

  const parsedStyle: DefineStyles = {
    backgroundColor: parsed.backgroundColor || "#333",
    color: parsed.color || "#ffffff",
    textAlign: parsed.textAlign || "center",
  };

  const handleLinkChange = (
    index: number,
    field: "url" | "text",
    value: string
  ) => {
    const updatedLinks = [...links];
    updatedLinks[index] = { ...updatedLinks[index], [field]: value };
    const newHtml = buildNavContent(updatedLinks);

    setJsonGridState((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        [elementId]: newHtml,
      },
    }));
  };

  const handleAddLink = () => {
    const updatedLinks = [...links, { url: "#", text: "New Link" }];
    const newHtml = buildNavContent(updatedLinks);

    setJsonGridState((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        [elementId]: newHtml,
      },
    }));
  };

  const handleRemoveLink = (index: number) => {
    const updatedLinks = links.filter((_, i) => i !== index);
    const newHtml = buildNavContent(updatedLinks);

    setJsonGridState((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        [elementId]: newHtml,
      },
    }));
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
      <h3>&lt;nav&gt; Editor: {elementId}</h3>

      {links.map((link, i) => (
        <div
          key={i}
          style={{
            marginBottom: "1rem",
            padding: "0.5rem",
            border: "1px solid #ddd",
            borderRadius: "4px",
          }}
        >
          <TextField
            label="URL"
            variant="outlined"
            value={link.url}
            onChange={(e) => handleLinkChange(i, "url", e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Display Text"
            variant="outlined"
            value={link.text}
            onChange={(e) => handleLinkChange(i, "text", e.target.value)}
            fullWidth
            margin="normal"
          />

          <Button
            onClick={() => handleRemoveLink(i)}
            variant="contained"
            color="error"
            style={{ marginTop: "0.5rem" }}
          >
            Remove Link
          </Button>
        </div>
      ))}

      <Button
        onClick={handleAddLink}
        variant="contained"
        color="primary"
        style={{ marginBottom: "1rem" }}
      >
        + Add Link
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

export default NavInputForm;
