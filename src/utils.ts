import { Cell, DraggedElement, JSONGridState, gridSize, DefineStyles } from "./types/canvasTypes";

export function parseStyleString(styleString: string): React.CSSProperties {
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

export function getCoordinates(cellNumber: number): { row: number; column: number } {
  return {
    row: Math.floor(cellNumber / gridSize),
    column: cellNumber % gridSize,
  };
}

export function generateJsonGrid(
  grid: (Cell | null)[][],
  defaultElementProps: { [key: string]: { content: string; styles: string; attributes?: string } },
  existingContent: { [key: string]: string } = {},
  existingStyles: { [key: string]: string } = {},
  existingAttributes: { [key: string]: string } = {},
): JSONGridState {
  const elementIndices: { [key: string]: number } = {};
  const assignedIndices: { [key: string]: number } = {};
  const layout: string[][] = [];
  // Start with any existing content/styles/attributes.
  const content: { [key: string]: string } = { ...existingContent };
  const styles: { [key: string]: string } = { ...existingStyles };
  const attributes: { [key: string]: string } = { ...existingAttributes };

  for (let i = 0; i < grid.length; i++) {
    const layoutRow: string[] = [];
    for (let j = 0; j < grid[i].length; j++) {
      const cell = grid[i][j];
      if (!cell) {
        layoutRow.push("");
      } else {
        if (cell.id.includes(".")) {
          layoutRow.push(cell.id);
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

            // Preserve any existing custom content or styles, otherwise fallback to defaults.
            content[uniqueId] =
              existingContent[uniqueId] !== undefined
                ? existingContent[uniqueId]
                : defaultElementProps[elementId]?.content || "";
            styles[uniqueId] =
              existingStyles[uniqueId] !== undefined
                ? existingStyles[uniqueId]
                : defaultElementProps[elementId]?.styles || "";
            attributes[uniqueId] =
              existingAttributes[uniqueId] !== undefined
                ? existingAttributes[uniqueId]
                : defaultElementProps[elementId]?.attributes || "";
          }  // <-- Added missing closing brace for if (!(instanceKey in assignedIndices))
          // Optionally, you might want to push something to layoutRow here if needed.
        }
      }
    }
    layout.push(layoutRow);
  }

  return {
    resolution: { width: 1920, height: 1080 },
    layout,
    content,
    styles,
    attributes
  };
}



export function parseJsonGrid(json: JSONGridState): (Cell | null)[][] {
  const layout = json.layout;
  const rows = layout.length;
  const cols = layout[0]?.length || 0;
  const grid: (Cell | null)[][] = Array.from({ length: rows }, () =>
    Array(cols).fill(null)
  );

  const visited: boolean[][] = Array.from({ length: rows }, () =>
    Array(cols).fill(false)
  );

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (visited[i][j]) continue;
      const cellValue = layout[i][j];
      if (cellValue === "") {
        visited[i][j] = true;
        continue;
      }

      const [elementId] = cellValue.split(".");
      let width = 1;
      while (j + width < cols && layout[i][j + width] === cellValue) {
        width++;
      }
      let height = 1;
      outer: while (i + height < rows) {
        for (let k = 0; k < width; k++) {
          if (layout[i + height][j + k] !== cellValue) {
            break outer;
          }
        }
        height++;
      }

      // Fill in the grid
      for (let r = i; r < i + height; r++) {
        for (let c = j; c < j + width; c++) {
          grid[r][c] = {
            id: elementId,
            width,
            height,
            row: i,
            column: j,
            main: r === i && c === j,
          };
          visited[r][c] = true;
        }
      }
    }
  }
  return grid;
}
export function styleObjectToCssString(styleObj: DefineStyles): string {
  return Object.entries(styleObj)
    .map(([key, value]) => `${key}: ${value};`)
    .join(" ");
}
export function clearOldPositions(grid: (Cell | null)[][], draggedElem: DraggedElement) {
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
