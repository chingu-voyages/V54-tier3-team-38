import React, { useEffect, useState } from "react";
import { List, ListItemButton, ListItemText } from "@mui/material";
import { generateHTMLFromJSONGrid } from "../utils"; // Adjust path as needed

// Define the type for a page as returned from the API
interface PageData {
  id: number | string;
  name: string;
  description: string;
  data: any; // This represents your JSONGridState
  created_at: string;
}

const PageList: React.FC = () => {
  const [pages, setPages] = useState<PageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BASE_URL}api/page-data/list/`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch pages.");
        }
        const data = await response.json();
        setPages(data);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  // When clicking a page link, generate HTML from the stored JSON and open it in a new tab.
  const handleOpenPage = (page: PageData) => {
    try {
      // Here, page.data is assumed to be the saved JSONGridState.
      const html = generateHTMLFromJSONGrid(page.data);
      const newWindow = window.open("", "_blank");
      if (newWindow) {
        newWindow.document.open();
        newWindow.document.write(html);
        newWindow.document.close();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to generate preview page.");
    }
  };

  if (loading) {
    return <div>Loading pages...</div>;
  }
  if (error) {
    return <div>Error: {error}</div>;
  }
  if (pages.length === 0) {
    return <div>No pages found.</div>;
  }

  return (
    <div>
      <h2>Your Pages</h2>
      <List>
        {pages.map((page) => (
          <ListItemButton key={page.id} onClick={() => handleOpenPage(page)}>
            <ListItemText
              primary={page.name || "Untitled Page"}
              secondary={new Date(page.created_at).toLocaleString()}
            />
          </ListItemButton>
        ))}
      </List>
    </div>
  );
};

export default PageList;
