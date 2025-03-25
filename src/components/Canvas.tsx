import React, { useState, useEffect } from "react";
import { IconButton, Snackbar, TextField } from "@mui/material";
import { Close } from "@mui/icons-material";
import Button from "./Button";
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
import { postGrid } from "../api/backendService";

/**
 * Our Canvas component. It manages the grid layout state, plus
 * loading / saving from localStorage.
 */
export const Canvas: React.FC = () => {
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

  useEffect(() => {
    const savedData = localStorage.getItem("gridEditorState");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // Make sure your parsed object has the structure you expect
        if (parsed.gridState) {
          setGridState(parsed.gridState);
        }
        if (parsed.jsonGridState) {
          setJsonGridState(parsed.jsonGridState);
        }
        if (parsed.draggedElement) {
          setDraggedElement(parsed.draggedElement);
        }
      } catch (error) {
        console.error("Error parsing saved localStorage data:", error);
      }
    }
  }, []);

  const saveAllStateToLocalStorage = (
    updatedGridState: (Cell | null)[][],
    updatedJsonGridState: JSONGridState,
    updatedDraggedElement: DraggedElement | null
  ) => {
    const dataToStore = {
      gridState: updatedGridState,
      jsonGridState: updatedJsonGridState,
      draggedElement: updatedDraggedElement,
    };
    try {
      localStorage.setItem("gridEditorState", JSON.stringify(dataToStore));
      // console.log("State saved to localStorage!");
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
      // 1. Copy current grid
      const newGrid = prevGrid.map((row) => [...row]);

      // 2. Clear old positions
      if (draggedElem.row >= 0 && draggedElem.column >= 0) {
        clearOldPositions(newGrid, draggedElem);
      }

      // 3. Place the element in new cells
      for (let r = 0; r < height; r++) {
        for (let c = 0; c < width; c++) {
          const rowIdx = newRow + r;
          const colIdx = newCol + c;
          if (rowIdx < gridSize && colIdx < gridSize) {
            newGrid[rowIdx][colIdx] = {
              id: draggedElem.id || "item",
              width,
              height,
              row: newRow,
              column: newCol,
              main: r === 0 && c === 0,
            };
          }
        }
      }

      // 4. Generate an updated JSON representation
      const newJson = generateJsonGrid(newGrid, defaultElementProps);
      setJsonGridState(newJson);

      // 5. Save to localStorage
      saveAllStateToLocalStorage(newGrid, newJson, draggedElement);

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
  }
  
  const handleSnackbarClose = () => setSnackbarOpen(false)

  const closeSnackbarAction = (
    <>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleSnackbarClose}
      >
        <Close />
      </IconButton>
  </>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <TextField label="Name" value={pageName} onChange={e=>setPageName(e.target.value)} />
      <TextField label="Description" value={pageDescription} onChange={e=>setPageDescription(e.target.value)} />

      <Button onClick={saveGrid} label="Save Grid" />

      {/* Example of a draggable element "toolbox" outside the grid */}
      <div
        data-id="h2"
        data-key="-1"
        data-defaultheight={2}
        data-defaultwidth={3}
        draggable={true}
        onDragStart={(e) => handleDragStart(e, setDraggedElement)}
        style={{
          width: CELL_SIZE,
          height: CELL_SIZE,
          border: "1px solid gray",
          boxSizing: "border-box",
          backgroundColor: "black",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "grab",
          marginBottom: "10px",
        }}
      >
        h2
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
                backgroundColor: cell ? "lightblue" : "white",
              }}
            >
              {cell &&
                cell.main &&
                (() => {
                  const uniqueId =
                    jsonGridState.layout[row] &&
                    jsonGridState.layout[row][column]
                      ? jsonGridState.layout[row][column]
                      : cell.id;
                  const defaultContent =
                    jsonGridState.content[uniqueId] || cell.id;
                  const defaultStyleString =
                    jsonGridState.styles[uniqueId] || "";
                  const parsedStyles = parseStyleString(defaultStyleString);

                  return (
                    <div
                      draggable={true}
                      onDragStart={(e) => handleDragStart(e, setDraggedElement)}
                      onDragOver={allowDrop}
                      onDrop={(e) =>
                        handleDrop(
                          e,
                          draggedElement,
                          jsonGridState,
                          updateGridState,
                          setDraggedElement
                        )
                      }
                      data-id={cell.id}
                      data-key={i.toString()}
                      onMouseDown={() => {
                        // Save the newly clicked/selected element
                        const newDragged = {
                          id: cell.id,
                          row: cell.row,
                          column: cell.column,
                          width: cell.width,
                          height: cell.height,
                          resizing: undefined,
                          rowOffset: 0,
                          columnOffset: 0,
                        };
                        setDraggedElement(newDragged);
                        saveAllStateToLocalStorage(
                          gridState,
                          jsonGridState,
                          newDragged
                        );
                        console.log(draggedElement);
                      }}
                      data-defaultwidth={cell.width}
                      data-defaultheight={cell.height}
                      style={{
                        width: cell.width * CELL_SIZE,
                        height: cell.height * CELL_SIZE,
                        ...parsedStyles,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "grab",
                        position: "absolute",
                        top: 0,
                        left: 0,
                        zIndex: 10,
                      }}
                    >
                      {defaultContent}
                      {/* Resizers */}
                      <div
                        data-resizer="left"
                        draggable={true}
                        onDragStart={(e) =>
                          handleResizeDrag(e, setDraggedElement)
                        }
                        onDragOver={(ev) => ev.preventDefault()}
                        style={{
                          position: "absolute",
                          width: "8px",
                          height: "50%",
                          backgroundColor: "grey",
                          border: "1px solid black",
                          cursor: "ew-resize",
                          left: "-4px",
                          top: "25%",
                        }}
                      />
                      <div
                        data-resizer="right"
                        draggable={true}
                        onDragStart={(e) =>
                          handleResizeDrag(e, setDraggedElement)
                        }
                        onDragOver={(ev) => ev.preventDefault()}
                        style={{
                          position: "absolute",
                          width: "8px",
                          height: "50%",
                          backgroundColor: "grey",
                          border: "1px solid black",
                          cursor: "ew-resize",
                          right: "-4px",
                          top: "25%",
                        }}
                      />
                      <div
                        data-resizer="top"
                        draggable={true}
                        onDragStart={(e) =>
                          handleResizeDrag(e, setDraggedElement)
                        }
                        onDragOver={(ev) => ev.preventDefault()}
                        style={{
                          position: "absolute",
                          width: "50%",
                          height: "8px",
                          backgroundColor: "grey",
                          border: "1px solid black",
                          cursor: "ns-resize",
                          top: "-4px",
                          left: "25%",
                        }}
                      />
                      <div
                        data-resizer="bottom"
                        draggable={true}
                        onDragStart={(e) =>
                          handleResizeDrag(e, setDraggedElement)
                        }
                        onDragOver={(ev) => ev.preventDefault()}
                        style={{
                          position: "absolute",
                          width: "50%",
                          height: "8px",
                          backgroundColor: "grey",
                          border: "1px solid black",
                          cursor: "ns-resize",
                          bottom: "-4px",
                          left: "25%",
                        }}
                      />
                    </div>
                  );
                })()}
            </div>
          );
        })}
      </div>
      <Snackbar open={snackbarOpen} message={snackbarMessage} autoHideDuration={3000} action={closeSnackbarAction} />
    </div>
  );
};
