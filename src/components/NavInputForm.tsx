import React, { useState, useEffect } from "react";
import { EditorProps } from "../types/canvasTypes";
import DeleteElementButton from "./DeleteElementButton";

/**
 * Extracts <a href="...">display</a> links from a string like:
 * "<a href='#home'>Home</a> | <a href='#about'>About</a>"
 */
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

/**
 * Rebuilds the nav HTML string from an array of { url, text }.
 * For example: [{url:"#home",text:"Home"},{url:"#about",text:"About"}]
 * => "<a href="#home">Home</a> | <a href="#about">About</a>"
 */
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
  // Initial HTML is what's currently in jsonGridState
  const originalHtml = jsonGridState.content[elementId] || "";
  // Parse out links for the form
  const [links, setLinks] = useState(() => parseNavLinks(originalHtml));

  // Also store styles locally
  const [styles, setStyles] = useState(
    () => jsonGridState.styles[elementId] || ""
  );

  // Sync changes back to jsonGridState.content and .styles
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

  // Handlers for link array
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

      {/* Render each link as a row with URL + Text + Remove button */}
      {links.map((link, i) => (
        <div
          key={i}
          style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}
        >
          <input
            type="text"
            placeholder="URL"
            value={link.url}
            onChange={(e) => handleLinkChange(i, "url", e.target.value)}
            style={{ flex: 1 }}
          />
          <input
            type="text"
            placeholder="Display Text"
            value={link.text}
            onChange={(e) => handleLinkChange(i, "text", e.target.value)}
            style={{ flex: 1 }}
          />
          <button type="button" onClick={() => handleRemoveLink(i)}>
            Remove
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
      <label>
        <p>Styles:</p>
        <textarea
          value={styles}
          onChange={(e) => setStyles(e.target.value)}
          style={{ width: "100%" }}
        />
      </label>

      {/* Delete Element */}
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
