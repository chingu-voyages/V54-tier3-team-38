import React, { useState, useEffect } from "react";
import { EditorProps } from "../types/canvasTypes";
import DeleteElementButton from "./DeleteElementButton";

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

  // Whenever links or styles change, update the main jsonGridState
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

      {/* Each link displayed in a vertical form */}
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
          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            URL:
            <input
              type="text"
              placeholder="URL"
              value={link.url}
              onChange={(e) => handleLinkChange(i, "url", e.target.value)}
              style={{ width: "100%", marginTop: "0.3rem" }}
            />
          </label>

          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            Display Text:
            <input
              type="text"
              placeholder="Display Text"
              value={link.text}
              onChange={(e) => handleLinkChange(i, "text", e.target.value)}
              style={{ width: "100%", marginTop: "0.3rem" }}
            />
          </label>

          <button type="button" onClick={() => handleRemoveLink(i)}>
            Remove Link
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={handleAddLink}
        style={{ marginBottom: "1rem" }}
      >
        + Add Link
      </button>

      {/* Styles field */}
      <label style={{ display: "block", marginBottom: "0.5rem" }}>
        Styles:
      </label>
      <textarea
        value={styles}
        onChange={(e) => setStyles(e.target.value)}
        style={{ width: "100%", marginBottom: "1rem", height: "4rem" }}
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
