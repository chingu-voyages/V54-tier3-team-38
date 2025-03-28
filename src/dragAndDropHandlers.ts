import React from "react";
import { getCoordinates } from "./utils";
import {
  DraggedElement,
  gridSize,
  JSONGridState,
} from "./types/canvasTypes";

export function allowDrop(e: React.DragEvent<HTMLDivElement>) {
  e.preventDefault(); // Required for onDrop to trigger
}

export function handleDragStart(
  e: React.DragEvent<HTMLDivElement>,
  setDraggedElement: React.Dispatch<React.SetStateAction<DraggedElement | null>>
) {
  const target = e.target as HTMLDivElement;
  const cellNumber = Number(target.dataset.key);
  const width = Number(target.dataset.defaultwidth) || 1;
  const height = Number(target.dataset.defaultheight) || 1;
  const { row, column } =
    cellNumber >= 0 ? getCoordinates(cellNumber) : { row: -1, column: -1 };

  const elementsUnderCursor = document.elementsFromPoint(e.clientX, e.clientY);
  const secondEl = elementsUnderCursor[1] as HTMLElement;
  const { row: dragRow, column: dragCol } = secondEl?.dataset?.key
    ? getCoordinates(Number(secondEl.dataset.key))
    : { row: -1, column: -1 };

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

export function handleResizeDrag(
  e: React.DragEvent<HTMLDivElement>,
  setDraggedElement: React.Dispatch<React.SetStateAction<DraggedElement | null>>
) {
  e.stopPropagation();
  const resizerTarget = e.target as HTMLDivElement;
  
  // Get the resize direction from the resizer handle.
  const direction = resizerTarget.dataset.resizer as "left" | "right" | "top" | "bottom";
  
  // Find the closest parent element that has the data-key attribute,
  // which represents the grid cell for the element being resized.
  const attachedElement = resizerTarget.closest('[data-key]') as HTMLDivElement;
  if (!attachedElement) {
    console.error("No attached element found for resizing.");
    return;
  }
  
  // Extract information from the attached element.
  const cellNumber = Number(attachedElement.dataset.key);
  const width = Number(attachedElement.dataset.defaultwidth) || 1;
  const height = Number(attachedElement.dataset.defaultheight) || 1;
  const { row, column } = getCoordinates(cellNumber);
  
  // Create the new dragged element with the proper attached element data.
  setDraggedElement({
    id: attachedElement.dataset.id || "",
    row,
    column,
    width,
    height,
    rowOffset: 0,
    columnOffset: 0,
    resizing: direction,
  });
}

export function isIntersectingOtherElement(
  targetCell: HTMLDivElement,
  draggedElement: DraggedElement | null,
  jsonGridState: JSONGridState
): boolean {
  
  if (!draggedElement) return false;

  // Get drop coordinates from the target cell's data-key.
  const { row: dropRow, column: dropColumn } = getCoordinates(
    Number(targetCell.dataset.key)
  );

  // Assume the current element's identifier is in its original top-left cell.
  const currentElementId =
    jsonGridState.layout[draggedElement.row]?.[draggedElement.column];

  // Define the bounds of the area to check.
  let startRow: number, endRow: number, startCol: number, endCol: number;

  if (!draggedElement.resizing) {
    // Regular drop: adjust by the stored offsets.
    startRow = dropRow - draggedElement.rowOffset;
    startCol = dropColumn - draggedElement.columnOffset;
    endRow = startRow + draggedElement.height - 1;
    endCol = startCol + draggedElement.width - 1;
  } else {
    // Resizing drop: determine bounds based on the resize direction.
    switch (draggedElement.resizing) {
      case "bottom":
        // New bottom boundary is dropRow; top remains unchanged.
        startRow = draggedElement.row;
        endRow = dropRow;
        startCol = draggedElement.column;
        endCol = draggedElement.column + draggedElement.width - 1;
        break;
      case "top":
        // New top boundary is dropRow; bottom remains unchanged.
        startRow = dropRow;
        endRow = draggedElement.row + draggedElement.height - 1;
        startCol = draggedElement.column;
        endCol = draggedElement.column + draggedElement.width - 1;
        break;
      case "left":
        // New left boundary is dropColumn; right remains unchanged.
        startCol = dropColumn;
        endCol = draggedElement.column + draggedElement.width - 1;
        startRow = draggedElement.row;
        endRow = draggedElement.row + draggedElement.height - 1;
        break;
      case "right":
        // New right boundary is dropColumn; left remains unchanged.
        startCol = draggedElement.column;
        endCol = dropColumn;
        startRow = draggedElement.row;
        endRow = draggedElement.row + draggedElement.height - 1;
        break;
      default:
        // Fallback: treat as a regular drop.
        startRow = dropRow - draggedElement.rowOffset;
        startCol = dropColumn - draggedElement.columnOffset;
        endRow = startRow + draggedElement.height - 1;
        endCol = startCol + draggedElement.width - 1;
        break;
    }
  }

  // Check each cell in the calculated bounds.
  for (let i = startRow; i <= endRow; i++) {
    for (let j = startCol; j <= endCol; j++) {
      if (
        jsonGridState.layout[i] &&
        jsonGridState.layout[i][j] &&
        jsonGridState.layout[i][j] !== "" &&
        jsonGridState.layout[i][j] !== currentElementId
      ) {
        console.log(`Intersection found at ${i}, ${j}: ${jsonGridState.layout[i][j]}`);
        return true;
      }
    }
  }
  return false;
}

export function handleDrop(
  e: React.DragEvent<HTMLDivElement>,
  draggedElement: DraggedElement | null,
  jsonGridState: JSONGridState,
  updateGridState: (
    draggedElem: DraggedElement,
    newRow: number,
    newCol: number,
    width: number,
    height: number
  ) => void,
  setDraggedElement: React.Dispatch<React.SetStateAction<DraggedElement | null>>
) {
  e.preventDefault();
  if (!draggedElement) return;

  let targetCell = e.target as HTMLDivElement;
  let cellKey = targetCell.dataset.key;
  if (!cellKey) {
    targetCell = targetCell.closest('[data-key]') as HTMLDivElement;
    cellKey = targetCell?.dataset.key;
  }
  
  if (!cellKey) {
    console.error("Drop target does not have a valid data-key");
    return;
  }
  if (isIntersectingOtherElement(targetCell, draggedElement, jsonGridState)) {
    console.warn("Drop intersects with another element, ignoring drop.");
    return;
  }
  
  // If the targetCell is actually the element’s child or resizer,
  // use elementsFromPoint to get the correct cell.
  if (targetCell.dataset.width || targetCell.dataset.defaultwidth) {
    const elements = document.elementsFromPoint(e.clientX, e.clientY);
    if (elements.length > 1) {
      targetCell = elements[1] as HTMLDivElement;
    }
  }

  const { row: newRow, column: newCol } = getCoordinates(
    Number(targetCell.dataset.key)
  );

  // Handle resizing
  if (draggedElement.resizing === "left") {
    const addedWidth = draggedElement.column - newCol;
    const updatedWidth = draggedElement.width + addedWidth;
    if (updatedWidth >= 1) {
      setDraggedElement((prev) =>
        prev ? { ...prev, column: newCol, width: updatedWidth } : prev
      );
      updateGridState(
        draggedElement,
        draggedElement.row,
        newCol,
        updatedWidth,
        draggedElement.height
      );
    }
    return;
  }

  if (draggedElement.resizing === "right") {
    const updatedWidth = Math.max(1, newCol - draggedElement.column + 1);
    setDraggedElement((prev) =>
      prev ? { ...prev, width: updatedWidth } : prev
    );
    updateGridState(
      draggedElement,
      draggedElement.row,
      draggedElement.column,
      updatedWidth,
      draggedElement.height
    );
    return;
  }

  if (draggedElement.resizing === "top") {
    const addedHeight = draggedElement.row - newRow;
    const updatedHeight = draggedElement.height + addedHeight;
    if (updatedHeight >= 1) {
      setDraggedElement((prev) =>
        prev ? { ...prev, row: newRow, height: updatedHeight } : prev
      );
      updateGridState(
        draggedElement,
        newRow,
        draggedElement.column,
        draggedElement.width,
        updatedHeight
      );
    }
    return;
  }

  if (draggedElement.resizing === "bottom") {
    const updatedHeight = Math.max(1, newRow - draggedElement.row + 1);
    setDraggedElement((prev) =>
      prev ? { ...prev, height: updatedHeight } : prev
    );
    updateGridState(
      draggedElement,
      draggedElement.row,
      draggedElement.column,
      draggedElement.width,
      updatedHeight
    );
    return;
  }

  // If it's not a resizing action, handle normal dragging
  const offsetY = draggedElement.rowOffset;
  const offsetX = draggedElement.columnOffset;
  const finalRow = offsetY ? newRow - offsetY : newRow;
  const finalCol = offsetX ? newCol - offsetX : newCol;

  if(draggedElement.row!=-1){
    if(finalCol+draggedElement.width>gridSize||finalRow+draggedElement.height>gridSize||finalCol<0||finalRow<0){
      console.log("grid bounds exceeded, drop ignored")
      return
    }
  }

  updateGridState(
    draggedElement,
    finalRow,
    finalCol,
    draggedElement.width,
    draggedElement.height
  );
  setDraggedElement({ ...draggedElement, row: finalRow, column: finalCol });
}
