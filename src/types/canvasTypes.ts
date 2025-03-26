export interface DefaultElementProps {
  [key: string]: {
    content: string;
    styles: string;
    defaultWidth: number;
    defaultHeight: number;
  };
}

  
  export const defaultElementProps: DefaultElementProps = {
    h2: {
      content: "Welcome to My Page",
      styles: "background: black; color: white; text-align: center;",
      defaultWidth: 3,
      defaultHeight: 2,
    },
    footer: {
      content: "© 2025 Your Company",
      styles: "background: #222; color: #ccc; padding: 1rem; text-align: center;",
      defaultWidth: 6,
      defaultHeight: 2,
    },
    nav: {
      content: "<a href='#'>Home</a> | <a href='#'>About</a> | <a href='#'>Contact</a>",
      styles: "background: #333; color: white; padding: 0.5rem; text-align: center;",
      defaultWidth: 6,
      defaultHeight: 2,
    },
    ul: {
      content: "<li>Item 1</li><li>Item 2</li><li>Item 3</li>",
      styles: "list-style-type: disc; padding-left: 2rem;",
      defaultWidth: 2,
      defaultHeight: 2,
    },
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
  