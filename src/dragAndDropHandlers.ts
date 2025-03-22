import React from "react";
import { getCoordinates } from "./utils";
import {
  DraggedElement,
  JSONGridState,
  Cell,
  gridSize,
} from "./types/canvasDataTypes";

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




export function isIntersectingOtherElement(
  targetCell: HTMLDivElement,
  draggedElement: DraggedElement | null,
  jsonGridState: JSONGridState
): boolean {
  if (!draggedElement) return false;

  let offsetX = 0;
  let offsetY = 0;
  if (draggedElement.row !== -1) {
    offsetX = draggedElement.columnOffset;
    offsetY = draggedElement.rowOffset;
  }

  const { row: dropRow, column: dropColumn } = getCoordinates(
    Number(targetCell.dataset.key)
  );

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
        jsonGridState.layout[i] &&
        jsonGridState.layout[i][j] !== "" &&
        (draggedElement.row < 0 ||
          jsonGridState.layout[draggedElement.row][draggedElement.column] !==
            jsonGridState.layout[i][j])
      ) {
        console.log(`Intersection found at ${i},${j}`);
        return true;
      }
    }
  }

  return false;
}

/**
 * Main drop handler for dragging/resizing
 */
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

  updateGridState(
    draggedElement,
    finalRow,
    finalCol,
    draggedElement.width,
    draggedElement.height
  );
  setDraggedElement({ ...draggedElement, row: finalRow, column: finalCol });
}
