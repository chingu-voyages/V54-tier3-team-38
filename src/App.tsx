import React, { useState, useEffect } from "react";
import "./App.css";

interface DefaultElementProps {
  [key: string]: {
    content: string;
    styles: string;
  };
}

const defaultElementProps: DefaultElementProps = {
  h2: {
    content: "Welcome to My Page",
    styles: "background: black; color: white; text-align: center;",
  },
  // Add other defaults (e.g., main, sidebar, footer) as needed
};

interface Cell {
  id: string;
  width: number;
  height: number;
  row: number;
  column: number;
  main: boolean;
}

interface Resolution {
  width: number;
  height: number;
}

interface JSONGridState {
  resolution: Resolution;
  layout: string[][];
  content: { [key: string]: string };
  styles: { [key: string]: string };
}

interface DraggedElement {
  id: string;
  row: number;
  column: number;
  width: number;
  height: number;
  resizing?: "left" | "right" | "top" | "bottom";
  rowOffset: number;
  columnOffset: number;
}

const gridSize = 10;
const CELL_SIZE = 50;

function App() {
  useEffect(() => {
    const savedData = localStorage.getItem("gridEditorState");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);

        // Make sure your parsed object has the structure you expect
        // before setting each piece of state.
        if (parsed.gridState) {
          setGridState(parsed.gridState);
        }
        if (parsed.jsonGridState) {
          setJsonGridState(parsed.jsonGridState);
        }
        // If you really want to keep `saveStatus` or `draggedElement` across sessions, do so:
        if (parsed.saveStatus) {
          setSaveStatus(parsed.saveStatus);
        }
        if (parsed.draggedElement) {
          setDraggedElement(parsed.draggedElement);
        }
      } catch (error) {
        console.error("Error parsing saved localStorage data:", error);
      }
    }
  }, []);

  const saveAllStateToLocalStorage = () => {
    const dataToStore = {
      saveStatus,
      gridState,
      jsonGridState,
      draggedElement,
    };
    try {
      localStorage.setItem("gridEditorState", JSON.stringify(dataToStore));
      console.log("State saved to localStorage!");
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  };

  const [saveStatus, setSaveStatus] = useState<string>("");
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

  const handleSave = async () => {
    setSaveStatus("Saving...");
    try {
      const response = await fetch("http://localhost:3000/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jsonGridState),
      });

      const data = await response.json();

      if (response.ok) {
        setSaveStatus(
          `✅ Saved! View at: http://localhost:3000/view/${data.id}`
        );
      } else {
        setSaveStatus(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setSaveStatus("❌ Failed to connect to the server.");
      console.error("Save error:", error);
    }
  };

  function handleResizeDrag(e: React.DragEvent<HTMLDivElement>) {
    e.stopPropagation();
    const target = e.target as HTMLDivElement;
    const direction = target.dataset.resizer as
      | "left"
      | "right"
      | "top"
      | "bottom";
    setDraggedElement((prev) =>
      prev ? { ...prev, resizing: direction } : null
    );
  }

  function handleResizeDrop(e: React.DragEvent<HTMLDivElement>) {
    console.log(e);
  }

  function handleDragStart(e: React.DragEvent<HTMLDivElement>) {
    const target = e.target as HTMLDivElement;
    const cellNumber = Number(target.dataset.key);
    const width = Number(target.dataset.defaultwidth) || 1;
    const height = Number(target.dataset.defaultheight) || 1;
    const { row, column } =
      cellNumber >= 0 ? getCoordinates(cellNumber) : { row: -1, column: -1 };

    const elementsUnderCursor = document.elementsFromPoint(
      e.clientX,
      e.clientY
    );
    const { row: dragRow, column: dragCol } = getCoordinates(
      Number((elementsUnderCursor[1] as HTMLElement)?.dataset?.key)
    );
    const rowOffset = dragRow - row;
    const columnOffset = dragCol - column;

    setDraggedElement({
      id: target.dataset.id || "",
      row,
      column,
      width,
      height,
      rowOffset,
      columnOffset,
    });
  }
  function isIntersectingOtherElement(targetCell: HTMLDivElement): boolean {
    let offsetX = 0;
    let offsetY = 0;
    if (draggedElement) {
      if (draggedElement.row && draggedElement.column) {
        if (draggedElement.row != -1) {
          offsetX = draggedElement.columnOffset;
          offsetY = draggedElement.rowOffset;
        }
        const { row: dropRow, column: dropColumn } = getCoordinates(
          Number(targetCell.dataset.key)
        );
        // console.log(
        //   draggedElement.row,
        //   draggedElement.column,
        //   draggedElement.rowOffset,
        //   draggedElement.columnOffset,
        //   draggedElement.width,
        //   draggedElement.height,
        //   dropColumn
        // );
        for (
          let i = dropRow - offsetY;
          i < dropRow - offsetY + draggedElement.height;
          i++
        ) {
          for (
            let j = dropColumn - offsetX;
            j < dropColumn - offsetX + draggedElement.width;
            j++
          ) {
            if (
              jsonGridState["layout"][i][j] !== "" &&
              (draggedElement.row < 0 ||
                jsonGridState["layout"][draggedElement.row][
                  draggedElement.column
                ] !== jsonGridState["layout"][i][j])
            ) {
              console.log(jsonGridState["layout"][i][j]);

              console.log(`intersection found at ${i},${j}`);
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    let targetCell = e.target as HTMLDivElement;
    if (isIntersectingOtherElement(targetCell)) {
      return;
    }
    //console.log(draggedElement);
    if (targetCell.dataset.width || targetCell.dataset.defaultwidth) {
      const elements = document.elementsFromPoint(e.clientX, e.clientY);
      if (elements.length > 1) {
        targetCell = elements[1] as HTMLDivElement;
      }
    }
    if (!draggedElement) return;
    const offsetY = draggedElement.rowOffset;
    const offsetX = draggedElement.columnOffset;
    const targetKey = targetCell.dataset.key;
    if (!targetKey) {
      console.warn("❌ Invalid drop target: No dataset.key found.");
      return;
    }
    const { row: newRow, column: newCol } = getCoordinates(Number(targetKey));

    // ----- Handle Resizing -----
    if (draggedElement.resizing === "left") {
      const addedWidth = draggedElement.column - newCol;
      const newWidth = draggedElement.width + addedWidth;
      if (newWidth >= 1) {
        setDraggedElement((prev) =>
          prev ? { ...prev, column: newCol, width: newWidth } : prev
        );
        updateGridState(
          draggedElement,
          draggedElement.row,
          newCol,
          newWidth,
          draggedElement.height
        );
      }
      return;
    }

    if (draggedElement.resizing === "right") {
      const newWidth = Math.max(1, newCol - draggedElement.column + 1);
      setDraggedElement((prev) => (prev ? { ...prev, width: newWidth } : prev));
      updateGridState(
        draggedElement,
        draggedElement.row,
        draggedElement.column,
        newWidth,
        draggedElement.height
      );
      return;
    }

    if (draggedElement.resizing === "top") {
      const addedHeight = draggedElement.row - newRow;
      const newHeight = draggedElement.height + addedHeight;
      if (newHeight >= 1) {
        setDraggedElement((prev) =>
          prev ? { ...prev, row: newRow, height: newHeight } : prev
        );
        updateGridState(
          draggedElement,
          newRow,
          draggedElement.column,
          draggedElement.width,
          newHeight
        );
      }
      return;
    }

    if (draggedElement.resizing === "bottom") {
      const newHeight = Math.max(1, newRow - draggedElement.row + 1);
      setDraggedElement((prev) =>
        prev ? { ...prev, height: newHeight } : prev
      );
      updateGridState(
        draggedElement,
        draggedElement.row,
        draggedElement.column,
        draggedElement.width,
        newHeight
      );
      return;
    }

    // ----- Handle Normal Dropping -----
    if (targetCell.dataset.width || targetCell.dataset.defaultwidth) {
      const elements = document.elementsFromPoint(e.clientX, e.clientY);
      if (elements.length > 1) {
        targetCell = elements[1] as HTMLDivElement;
      }
    }
    const cellNumberStr = targetCell.dataset.key;
    if (cellNumberStr === undefined) {
      console.warn("Invalid drop target, ignoring.");
      return;
    }

    let { row, column } = getCoordinates(Number(cellNumberStr));

    updateGridState(
      draggedElement,
      offsetY ? row - offsetY : row,
      offsetX ? column - offsetX : column,
      draggedElement.width,
      draggedElement.height
    );
    row = offsetY ? row - offsetY : row;
    column = offsetX ? column - offsetX : column;
    setDraggedElement({ ...draggedElement, row, column });
  }

  function updateGridState(
    draggedElem: DraggedElement,
    newRow: number,
    newCol: number,
    width: number,
    height: number
  ) {
    saveAllStateToLocalStorage();
    setGridState((prevGrid) => {
      const newGrid = prevGrid.map((row) => [...row]);
      // Clear previous positions if already placed.
      if (draggedElem.row >= 0 && draggedElem.column >= 0) {
        clearOldPositions(newGrid, draggedElem);
      }

      // Place the element into the new grid cells.
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

      // Generate and update the JSON grid state.
      const newJsonGrid = generateJsonGrid(newGrid);
      setJsonGridState(newJsonGrid);

      return newGrid;
    });
  }
  function parseStyleString(styleString: string): React.CSSProperties {
    const style: React.CSSProperties = {};
    styleString.split(";").forEach((rule) => {
      const [property, value] = rule.split(":");
      if (property && value) {
        const camelKey = property
          .trim()
          .replace(/-([a-z])/g, (_, char) => char.toUpperCase());
        (style as Record<string, any>)[camelKey] = value.trim();
      }
    });
    return style;
  }

  function clearOldPositions(
    grid: (Cell | null)[][],
    draggedElem: DraggedElement
  ) {
    const { row, column, width, height } = draggedElem;
    if (row < 0 || column < 0) return;
    for (let r = 0; r < height; r++) {
      for (let c = 0; c < width; c++) {
        const prevRow = row + r;
        const prevCol = column + c;
        if (
          prevRow >= 0 &&
          prevRow < gridSize &&
          prevCol >= 0 &&
          prevCol < gridSize
        ) {
          grid[prevRow][prevCol] = null;
        }
      }
    }
  }

  function generateJsonGrid(grid: (Cell | null)[][]): JSONGridState {
    const elementIndices: { [key: string]: number } = {};
    const assignedIndices: { [key: string]: number } = {};
    const layout: string[][] = [];
    const content: { [key: string]: string } = {};
    const styles: { [key: string]: string } = {};

    for (let i = 0; i < grid.length; i++) {
      const layoutRow: string[] = [];
      for (let j = 0; j < grid[i].length; j++) {
        const cell = grid[i][j];
        if (!cell) {
          layoutRow.push("");
        } else {
          const elementId = cell.id;
          const instanceKey = `${elementId}-${cell.row},${cell.column}`;
          if (!(instanceKey in assignedIndices)) {
            if (!(elementId in elementIndices)) {
              elementIndices[elementId] = 0;
            } else {
              elementIndices[elementId] += 1;
            }
            assignedIndices[instanceKey] = elementIndices[elementId];
            const uniqueId = `${elementId}.${assignedIndices[instanceKey]}`;
            content[uniqueId] = defaultElementProps[elementId]?.content || "";
            styles[uniqueId] = defaultElementProps[elementId]?.styles || "";
          }
          layoutRow.push(`${elementId}.${assignedIndices[instanceKey]}`);
        }
      }
      layout.push(layoutRow);
    }

    return {
      resolution: { width: 1920, height: 1080 },
      layout,
      content,
      styles,
    };
  }
  function parseJsonGrid(json: JSONGridState): (Cell | null)[][] {
    const layout = json.layout;
    const rows = layout.length;
    const cols = layout[0]?.length || 0;
    // Initialize the grid with null values.
    const grid: (Cell | null)[][] = Array.from({ length: rows }, () =>
      Array(cols).fill(null)
    );
    // A helper matrix to track which cells have been processed.
    const visited: boolean[][] = Array.from({ length: rows }, () =>
      Array(cols).fill(false)
    );

    // Loop over each cell in the layout.
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (visited[i][j]) continue;
        const cellValue = layout[i][j];
        // If the cell is empty, mark as visited and continue.
        if (cellValue === "") {
          visited[i][j] = true;
          continue;
        }
        // The cell value is of the form "elementId.instance"
        const [elementId] = cellValue.split(".");

        // Determine the width by checking contiguous cells to the right that share the same value.
        let width = 1;
        while (j + width < cols && layout[i][j + width] === cellValue) {
          width++;
        }

        // Determine the height by checking subsequent rows.
        let height = 1;
        outer: while (i + height < rows) {
          for (let k = 0; k < width; k++) {
            if (layout[i + height][j + k] !== cellValue) {
              break outer;
            }
          }
          height++;
        }

        // Fill in the grid for this element.
        for (let r = i; r < i + height; r++) {
          for (let c = j; c < j + width; c++) {
            grid[r][c] = {
              id: elementId,
              width,
              height,
              row: i, // top-left row of the element
              column: j, // top-left column of the element
              main: r === i && c === j,
            };
            visited[r][c] = true;
          }
        }
      }
    }
    return grid;
  }

  function allowDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault(); // Required for onDrop to trigger.
  }

  function getCoordinates(cellNumber: number): { row: number; column: number } {
    return {
      row: Math.floor(cellNumber / gridSize),
      column: cellNumber % gridSize,
    };
  }

  return (
    <>
      <h3>JSON Grid Representation:</h3>
      <pre
        style={{
          whiteSpace: "pre",
          fontFamily: "monospace",
          overflowX: "auto",
          maxHeight: "300px",
          border: "1px solid #ccc",
          padding: "10px",
        }}
      >
        {JSON.stringify(jsonGridState, null, 1)}
      </pre>
      <button
        onClick={handleSave}
        style={{
          margin: "10px 0",
          padding: "10px",
          fontSize: "16px",
          backgroundColor: "#007BFF",
          color: "white",
          border: "none",
          cursor: "pointer",
          borderRadius: "5px",
        }}
      >
        Save Grid
      </button>
      {saveStatus && (
        <p
          style={{
            fontWeight: "bold",
            color: saveStatus.includes("❌") ? "red" : "green",
          }}
        >
          {saveStatus}
        </p>
      )}
      <div
        data-id="h2"
        data-key="-1"
        data-defaultheight={2}
        data-defaultwidth={3}
        draggable={true}
        onDragStart={handleDragStart}
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
          // Compute the cell's row and column using your getCoordinates helper.
          const { row, column } = getCoordinates(i);

          return (
            <div
              key={i}
              data-key={i.toString()}
              onDrop={handleDrop}
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
                      onDragStart={handleDragStart}
                      onDragOver={allowDrop}
                      onDrop={handleDrop}
                      data-id={cell.id}
                      data-key={i.toString()}
                      onClick={() => {
                        setDraggedElement({
                          id: cell.id,
                          row: cell.row,
                          column: cell.column,
                          width: cell.width,
                          height: cell.height,
                          // no resizing in a simple click scenario
                          resizing: undefined,
                          // defaults for click since there's no drag offset
                          rowOffset: 0,
                          columnOffset: 0,
                        });
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

                      <div
                        data-resizer="left"
                        draggable={true}
                        onDragStart={handleResizeDrag}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleResizeDrop}
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
                        onDragStart={handleResizeDrag}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleResizeDrop}
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
                        onDragStart={handleResizeDrag}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleResizeDrop}
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
                        onDragStart={handleResizeDrag}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleResizeDrop}
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
    </>
  );
}

export default App;
