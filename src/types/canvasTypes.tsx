import { ComponentType, Dispatch, SetStateAction } from "react";
import H2InputForm from "../components/H2InputForm"; // adjust path as needed
import FooterInputForm from "../components/FooterInputForm";
import NavInputForm from "../components/NavInputForm";
import UlInputForm from "../components/UlInputForm";

// Basic Cell interface
export interface Cell {
  id: string;
  width: number;
  height: number;
  row: number;
  column: number;
  main: boolean;
}

// The grid layout resolution
export interface Resolution {
  width: number;
  height: number;
}
export interface EditorProps {
  elementId: string;
  jsonGridState: JSONGridState;
  setJsonGridState: Dispatch<SetStateAction<JSONGridState>>;
  gridState: (Cell | null)[][];
  setGridState: Dispatch<SetStateAction<(Cell | null)[][]>>;
  setActiveEditor: Dispatch<SetStateAction<ActiveEditor | null>>;
}

// The entire grid's JSON representation
export interface JSONGridState {
  resolution: Resolution;
  layout: string[][];
  content: { [key: string]: string };
  styles: { [key: string]: string };
}

// For dragging an element around
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

export interface ActiveEditor {
  id: string;
  type: string;
}

export interface ElementDefinition {
  content: string;
  styles: string;
  defaultWidth: number;
  defaultHeight: number;
  editor?: ComponentType<EditorProps>;
}

// All element definitions
export interface DefaultElementProps {
  [key: string]: ElementDefinition;
}

export const defaultElementProps: DefaultElementProps = {
  h2: {
    content: "Welcome to My Page",
    styles: "background: black; color: white; text-align: center;",
    defaultWidth: 3,
    defaultHeight: 2,
    editor: H2InputForm,
  },
  footer: {
    content: "© 2025 Your Company",
    styles: "background: #222; color: #ccc; text-align: center;",
    defaultWidth: 6,
    defaultHeight: 2,
    editor: FooterInputForm,
  },
  nav: {
    content:
      "<a href='#'>Home</a> | <a href='#'>About</a> | <a href='#'>Contact</a>",
    styles: "background: #333; color: white; text-align: center;",
    defaultWidth: 6,
    defaultHeight: 2,
    editor: NavInputForm,
  },
  ul: {
    content: "<li>Item 1</li><li>Item 2</li><li>Item 3</li>",
    styles: "list-style-type: disc;",
    defaultWidth: 2,
    defaultHeight: 2,
    editor: UlInputForm,
  },
};
