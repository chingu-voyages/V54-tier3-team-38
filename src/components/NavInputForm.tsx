import { useState, useEffect } from "react";
import { EditorProps } from "../types/canvasTypes";
import DeleteElementButton from "./DeleteElementButton";
import { TextField, Button } from "@mui/material";

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
}) => {
  const originalHtml = jsonGridState.content[elementId] || "";
  const [links, setLinks] = useState(() => parseNavLinks(originalHtml));
  const [styles, setStyles] = useState(
    () => jsonGridState.styles[elementId] || ""
  );

  // Update JSON grid state whenever links or styles change
  useEffect(() => {
    const newHtml = buildNavContent(links);
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
  }, [links, styles, elementId, setJsonGridState]);

  const handleLinkChange = (
    index: number,
    field: "url" | "text",
    value: string
  ) => {
    setLinks((prev) => {
      const clone = [...prev];
      clone[index] = { ...clone[index], [field]: value };
      return clone;
    });
  };

  const handleAddLink = () => {
    setLinks((prev) => [...prev, { url: "#", text: "New Link" }]);
  };

  const handleRemoveLink = (index: number) => {
    setLinks((prev) => prev.filter((_, i) => i !== index));
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
      />
    </div>
  );
};

export default NavInputForm;
