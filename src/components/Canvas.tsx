import { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { IconButton, Snackbar, TextField } from "@mui/material";
import { Close } from "@mui/icons-material";
import Button from "./Button";
import parse from "html-react-parser";

// let instanceCounters: Record<string, number> = {};

import {
  Cell,
  JSONGridState,
  DraggedElement,
  CELL_SIZE,
  gridSize,
  defaultElementProps,
} from "../types/canvasTypes";
import {
  parseStyleString,
  generateJsonGrid,
  clearOldPositions,
  getCoordinates,
} from "../utils";
import {
  allowDrop,
  handleDragStart,
  handleResizeDrag,
  handleDrop,
} from "../dragAndDropHandlers";
import { postGrid } from "@/api/backendService";

interface ActiveEditor {
  id: string;
  type: string;
}

export const Canvas: React.FC = () => {
  const GAP = 2;
  const [instanceCounters, setInstanceCounters] = useState<
    Record<string, number>
  >({});
  const [gridState, setGridState] = useState<(Cell | null)[][]>(
    Array.from({ length: gridSize }, () => Array(gridSize).fill(null))
  );

  const [jsonGridState, setJsonGridState] = useState<JSONGridState>({
    resolution: { width: 1920, height: 1080 },
    layout: Array.from({ length: gridSize }, () => Array(gridSize).fill("")),
    content: {},
    styles: {},
  });

  const [draggedElement, setDraggedElement] = useState<DraggedElement | null>(
    null
  );
  const [pageName, setPageName] = useState("Default Name");
  const [pageDescription, setPageDescription] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const [activeEditor, setActiveEditor] = useState<ActiveEditor | null>(null);

  useEffect(() => {
    const savedData = localStorage.getItem("gridEditorState");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.gridState) {
          setGridState(parsed.gridState);
        }
        if (parsed.jsonGridState) {
          setJsonGridState(parsed.jsonGridState);
        }
        if (parsed.draggedElement) {
          setDraggedElement(parsed.draggedElement);
        }
        if (parsed.instanceCounters) {
          setInstanceCounters(parsed.instanceCounters);
        }
      } catch (error) {
        console.error("Error parsing saved localStorage data:", error);
      }
    }
  }, []);

  const saveAllStateToLocalStorage = (
    updatedGridState: (Cell | null)[][],
    updatedJsonGridState: JSONGridState,
    updatedDraggedElement: DraggedElement | null,
    updatedInstanceCounters: object
  ) => {
    const dataToStore = {
      gridState: updatedGridState,
      jsonGridState: updatedJsonGridState,
      draggedElement: updatedDraggedElement,
      instanceCounters: updatedInstanceCounters,
    };
    try {
      localStorage.setItem("gridEditorState", JSON.stringify(dataToStore));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  };

  function updateGridState(
    draggedElem: DraggedElement,
    newRow: number,
    newCol: number,
    width: number,
    height: number
  ) {
    setGridState((prevGrid) => {
      const newGrid = prevGrid.map((row) => [...row]);
      if (draggedElem.row >= 0 && draggedElem.column >= 0) {
        clearOldPositions(newGrid, draggedElem);
      }

      let uniqueId = draggedElem.id;
      if (!uniqueId.includes(".")) {
        const type = uniqueId;
        if (!(type in instanceCounters)) {
          instanceCounters[type] = 1;
        } else {
          instanceCounters[type] += 1;
        }
        uniqueId = `${type}.${instanceCounters[type]}`;
        draggedElem = { ...draggedElem, id: uniqueId };
      }

      for (let r = 0; r < height; r++) {
        for (let c = 0; c < width; c++) {
          const rowIdx = newRow + r;
          const colIdx = newCol + c;
          if (rowIdx < gridSize && colIdx < gridSize) {
            newGrid[rowIdx][colIdx] = {
              id: uniqueId,
              width,
              height,
              row: newRow,
              column: newCol,
              main: r === 0 && c === 0,
            };
          }
        }
      }

      const newJson = generateJsonGrid(
        newGrid,
        defaultElementProps,
        jsonGridState.content,
        jsonGridState.styles
      );
      setJsonGridState(newJson);
      saveAllStateToLocalStorage(
        newGrid,
        newJson,
        draggedElem,
        instanceCounters
      );
      return newGrid;
    });
  }

  const saveGrid = async () => {
    try {
      await postGrid(pageName, pageDescription, jsonGridState);
      setSnackbarMessage("Data was saved successfully. Thank you!");
      setSnackbarOpen(true);
    } catch (e) {
      setSnackbarMessage("There was an error posting data, please try again.");
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => setSnackbarOpen(false);

  const closeSnackbarAction = (
    <IconButton
      size="small"
      aria-label="close"
      color="inherit"
      onClick={handleSnackbarClose}
    >
      <Close />
    </IconButton>
  );

  return (
    <>
      <Button
        onClick={() => {
          localStorage.removeItem("gridEditorState");
          window.location.reload();
        }}
        label="Reset Editor"
      />

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <TextField
          label="Name"
          value={pageName}
          onChange={(e) => setPageName(e.target.value)}
        />
        <TextField
          label="Description"
          value={pageDescription}
          onChange={(e) => setPageDescription(e.target.value)}
        />

        <Button onClick={saveGrid} label="Save Grid" />

        {/* Flex layout: toolbox on left, grid on right */}
        <div style={{ display: "flex", gap: "2rem" }}>
          {/* Toolbox */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              maxHeight: "600px",
              overflowY: "auto",
              border: "1px solid #ccc",
              padding: "0.5rem",
              minWidth: "120px",
            }}
          >
            {Object.entries(defaultElementProps).map(
              ([element, { styles, defaultWidth, defaultHeight }]) => (
                <div
                  key={element}
                  data-id={element}
                  data-key="-1"
                  data-defaultheight={defaultHeight}
                  data-defaultwidth={defaultWidth}
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, setDraggedElement)}
                  style={{
                    width: 80,
                    height: 40,
                    border: "1px solid gray",
                    boxSizing: "border-box",
                    cursor: "grab",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.8rem",
                    textTransform: "uppercase",
                    ...parseStyleString(styles),
                  }}
                >
                  {element}
                </div>
              )
            )}
          </div>

          {/* The grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${gridSize}, ${CELL_SIZE}px)`,
              gridTemplateRows: `repeat(${gridSize}, ${CELL_SIZE}px)`,
              gap: "2px",
              position: "relative",
              zIndex: 1,
            }}
          >
            {gridState.flat().map((cell, i) => {
              const row = Math.floor(i / gridSize);
              const column = i % gridSize;

              if (!cell)
                return (
                  <div
                    key={i}
                    data-key={i.toString()}
                    onDrop={(e) =>
                      handleDrop(
                        e,
                        draggedElement,
                        jsonGridState,
                        updateGridState,
                        setDraggedElement
                      )
                    }
                    onDragOver={allowDrop}
                    style={{
                      width: CELL_SIZE,
                      height: CELL_SIZE,
                      border: "1px solid gray",
                      boxSizing: "border-box",
                      backgroundColor: "white",
                    }}
                  />
                );

              const baseType = cell.id.split(".")[0];
              const Wrapper: React.ElementType =
                baseType as unknown as React.ElementType;

              const uniqueId =
                jsonGridState.layout[row] && jsonGridState.layout[row][column]
                  ? jsonGridState.layout[row][column]
                  : cell.id;

              const defaultContent =
                jsonGridState.content[uniqueId] ??
                defaultElementProps[baseType]?.content ??
                baseType;
              const defaultStyleString =
                jsonGridState.styles[uniqueId] ??
                defaultElementProps[baseType]?.styles ??
                "";

              const parsedStyles = parseStyleString(defaultStyleString);

              return (
                <div
                  key={i}
                  data-key={i.toString()}
                  onDrop={(e) =>
                    handleDrop(
                      e,
                      draggedElement,
                      jsonGridState,
                      updateGridState,
                      setDraggedElement
                    )
                  }
                  onDragOver={allowDrop}
                  style={{
                    width: CELL_SIZE,
                    height: CELL_SIZE,
                    border: "1px solid gray",
                    boxSizing: "border-box",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    backgroundColor: "white",
                  }}
                >
                  {cell.main &&
                    (() => (
                      <Wrapper
                        draggable={true}
                        onDragStart={(e: React.DragEvent<HTMLDivElement>) =>
                          handleDragStart(e, setDraggedElement)
                        }
                        onDragOver={allowDrop}
                        onDrop={(e: React.DragEvent<HTMLDivElement>) =>
                          handleDrop(
                            e,
                            draggedElement,
                            jsonGridState,
                            updateGridState,
                            setDraggedElement
                          )
                        }
                        onClick={() =>
                          setActiveEditor({ id: uniqueId, type: baseType })
                        }
                        data-id={uniqueId}
                        data-key={i.toString()}
                        data-defaultwidth={cell.width}
                        data-defaultheight={cell.height}
                        style={{
                          width: cell.width * (CELL_SIZE + GAP),
                          height: cell.height * (CELL_SIZE + GAP),
                          ...parsedStyles,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          position: "absolute",
                          top: 0,
                          left: 0,
                          zIndex: 10,
                        }}
                      >
                        {parse(defaultContent)}
                        {["left", "right", "top", "bottom"].map((dir) => {
                          const isHorizontal =
                            dir === "left" || dir === "right";
                          return (
                            <div
                              key={dir}
                              data-resizer={dir}
                              draggable={true}
                              onDragStart={(e) =>
                                handleResizeDrag(e, setDraggedElement)
                              }
                              onDragOver={(ev) => ev.preventDefault()}
                              style={{
                                position: "absolute",
                                width: isHorizontal ? "8px" : "50%",
                                height: isHorizontal ? "50%" : "8px",
                                backgroundColor: "grey",
                                border: "1px solid black",
                                cursor:
                                  dir === "left" || dir === "right"
                                    ? "ew-resize"
                                    : "ns-resize",
                                ...(dir === "left" && {
                                  left: "-4px",
                                  top: "25%",
                                }),
                                ...(dir === "right" && {
                                  right: "-4px",
                                  top: "25%",
                                }),
                                ...(dir === "top" && {
                                  top: "-4px",
                                  left: "25%",
                                }),
                                ...(dir === "bottom" && {
                                  bottom: "-4px",
                                  left: "25%",
                                }),
                              }}
                            />
                          );
                        })}
                      </Wrapper>
                    ))()}
                </div>
              );
            })}
          </div>
        </div>

        <Snackbar
          open={snackbarOpen}
          message={snackbarMessage}
          autoHideDuration={3000}
          action={closeSnackbarAction}
        />
      </div>

      {/* Render the active editor in a fixed sidebar via a portal */}
      {ReactDOM.createPortal(
        <div
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            width: "300px",
            height: "100vh",
            overflowY: "auto",
            padding: "1rem",
            borderLeft: "1px solid #ccc",
            backgroundColor: "#f9f9f9",
            zIndex: 1000,
          }}
        >
          {activeEditor ? (
            (() => {
              const elementDef = defaultElementProps[activeEditor.type];
              if (elementDef && elementDef.editor) {
                const EditorComponent = elementDef.editor;
                return (
                  <EditorComponent
                    key={activeEditor.id}
                    elementId={activeEditor.id}
                    jsonGridState={jsonGridState}
                    setJsonGridState={setJsonGridState}
                    setActiveEditor={setActiveEditor}
                    gridState={gridState}
                    setGridState={setGridState}
                    defaultElementProps={defaultElementProps}
                    saveAllStateToLocalStorage={saveAllStateToLocalStorage}
                    instanceCounters={instanceCounters}
                    draggedElement={draggedElement}
                  />
                );
              }
              return <p>No editor available for {activeEditor.type}.</p>;
            })()
          ) : (
            <p>Click an element on the grid to edit it.</p>
          )}
        </div>,
        document.body
      )}
    </>
  );
};
