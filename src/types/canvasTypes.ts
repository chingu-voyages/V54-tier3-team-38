export interface DefaultElementProps {
    [key: string]: {
      content: string;
      styles: string;
    };
  }
  
  export const defaultElementProps: DefaultElementProps = {
    h2: {
      content: "Welcome to My Page",
      styles: "background: black; color: white; text-align: center;",
    },
    // Add other defaults (e.g., main, sidebar, footer) as needed
  };
  
  export interface Cell {
    id: string;
    width: number;
    height: number;
    row: number;
    column: number;
    main: boolean;
  }
  
  export interface Resolution {
    width: number;
    height: number;
  }
  
  export interface JSONGridState {
    resolution: Resolution;
    layout: string[][];
    content: { [key: string]: string };
    styles: { [key: string]: string };
  }
  
  export interface DraggedElement {
    id: string;
    row: number;
    column: number;
    width: number;
    height: number;
    resizing?: "left" | "right" | "top" | "bottom";
    rowOffset: number;
    columnOffset: number;
  }
  
  export const gridSize = 10;
  export const CELL_SIZE = 50;
  