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
  defaultElementProps: { [key: string]: { content: string; styles: string } },
  existingContent: { [key: string]: string } = {},
  existingStyles: { [key: string]: string } = {},
  existingAttributes: { [key: string]: string } = {}
): JSONGridState {
  const elementIndices: { [key: string]: number } = {};
  const assignedIndices: { [key: string]: number } = {};
  const layout: string[][] = [];
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
                : elementId === "a"
                ? `href="https://www.google.com"`
                : "";
                
            layoutRow.push(uniqueId);
          } else {
            layoutRow.push(`${elementId}.${assignedIndices[instanceKey]}`);
          }
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
    attributes,
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
export function convertCamelToCss(style: Partial<DefineStyles>): string {
  const mappedStyle: Record<string, string> = {};
  for (const key in style) {
    const value = style[key as keyof DefineStyles];
    if (!value) continue;
    let cssKey = key;
    if (key === "backgroundColor") cssKey = "background";
    else if (key === "textAlign") cssKey = "text-align";
    else cssKey = key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
    mappedStyle[cssKey] = value;
  }
  return Object.entries(mappedStyle)
    .map(([k, v]) => `${k}: ${v};`)
    .join(" ");
}

export function generateHTMLFromJSONGrid(jsonGridState: JSONGridState): string {
  const {
    layout,
    content = {},
    styles = {},
    attributes = {}, // ✅ now safe if undefined
    resolution = { width: 1920, height: 1080 },
  } = jsonGridState;

  const { width: screenWidth, height: screenHeight } = resolution;
  const numRows = layout.length;
  const numCols = layout[0]?.length || 0;
  const cellHeight = Math.floor(screenHeight / numRows);
  const cellWidth = Math.floor(screenWidth / numCols);


  const boundingBoxes: Record<string, { minRow: number; maxRow: number; minCol: number; maxCol: number; }> = {};
  const renderedKeys = new Set<string>();
  let elementsHtml = "";

  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numCols; j++) {
      const key = layout[i][j];
      if (!key) continue;
      if (!boundingBoxes[key]) {
        boundingBoxes[key] = { minRow: i, maxRow: i, minCol: j, maxCol: j };
      } else {
        boundingBoxes[key].minRow = Math.min(boundingBoxes[key].minRow, i);
        boundingBoxes[key].maxRow = Math.max(boundingBoxes[key].maxRow, i);
        boundingBoxes[key].minCol = Math.min(boundingBoxes[key].minCol, j);
        boundingBoxes[key].maxCol = Math.max(boundingBoxes[key].maxCol, j);
      }
    }
  }

  for (const key of Object.keys(boundingBoxes)) {
    if (renderedKeys.has(key)) continue;
    renderedKeys.add(key);

    const tag = key.split(".")[0];
    const box = boundingBoxes[key];
    const mergedTop = box.minRow * cellHeight;
    const mergedLeft = box.minCol * cellWidth;
    const mergedWidth = (box.maxCol - box.minCol + 1) * cellWidth;
    const mergedHeight = (box.maxRow - box.minRow + 1) * cellHeight;

    const userStyle = styles[key] || "";
    const baseStyle = `position:absolute;top:${mergedTop}px;left:${mergedLeft}px;width:${mergedWidth}px;height:${mergedHeight}px;margin:0;display:block;`;
    const finalStyle = `${convertCamelToCss(parseStyleString(userStyle))} ${baseStyle}`.trim();

    const rawContent = (content[key] || "").trim();
    const extraAttributes = attributes[key]?.trim() || "";

    const elementHtml =
    tag === "a"
      ? `<div style="${finalStyle}">${rawContent}</div>` // ✅ safe wrapper
      : `<${tag} style="${finalStyle}">${rawContent}</${tag}>`;
  

    elementsHtml += elementHtml;
  }

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview</title>
    <style>
      html, body { margin: 0; padding: 0; overflow: auto; }
      .container { position: relative; width: ${screenWidth}px; height: ${screenHeight}px; }
    </style>
  </head>
  <body>
    <div class="container">
      ${elementsHtml}
    </div>
  </body>
</html>`;
}


export function findCell(
  gridState: (Cell | null)[][],
  elementId: string
): Cell | null {
  for (const row of gridState) {
    for (const cell of row) {
      if (cell && cell.id === elementId && cell.main) {
        return cell;
      }
    }
  }
  return null;
}

/**
 * Returns an absolute-position CSS string for a grid cell.
 */
export function makePositionStyle(
  row: number,
  col: number,
  width: number,
  height: number,
  cellSize: number
): string {
  const top = row * cellSize;
  const left = col * cellSize;
  const w = width * cellSize;
  const h = height * cellSize;
  return `position:absolute;top:${top}px;left:${left}px;width:${w}px;height:${h}px;margin:0;display:block;`;
}
