import { ComponentType, Dispatch, SetStateAction } from "react";
import HeaderInputForm from "../components/HeaderInputForm";
import FooterInputForm from "../components/FooterInputForm";
import NavInputForm from "../components/NavInputForm";
import UlInputForm from "../components/UlInputForm";
import ButtonInputForm from "../components/ButtonInputForm";
import AInputForm from "../components/AInputForm";

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
export interface EditorProps {
  elementId: string;
  jsonGridState: JSONGridState;
  setJsonGridState: Dispatch<SetStateAction<JSONGridState>>;
  gridState: (Cell | null)[][];
  setGridState: Dispatch<SetStateAction<(Cell | null)[][]>>;
  setActiveEditor: Dispatch<SetStateAction<ActiveEditor | null>>;
  defaultElementProps: DefaultElementProps;
  saveAllStateToLocalStorage: Function;
  instanceCounters: object;
  draggedElement: object | null;
}

// The entire grid's JSON representation
export interface JSONGridState {
  resolution: Resolution;
  layout: string[][];
  content: { [key: string]: string };
  styles: { [key: string]: string };
}
export interface DefineStyles {
  backgroundColor: string;
  color: string;
  textAlign: string;
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
  h1: {
    content: "My Page",
    styles:
      "background-color: black; color: white; text-align: center; position: static; margin: 0; padding: 0;",
    defaultWidth: 3,
    defaultHeight: 2,
    editor: HeaderInputForm,
  },
  h2: {
    content: "Welcome to My Page",
    styles:
      "background-color: black; color: white; text-align: center; position: static; margin: 0; padding: 0;",
    defaultWidth: 3,
    defaultHeight: 2,
    editor: HeaderInputForm,
  },
  h3: {
    content: "So glad you could visit",
    styles:
      "background-color: black; color: white; text-align: center; position: static; margin: 0; padding: 0;",
    defaultWidth: 3,
    defaultHeight: 2,
    editor: HeaderInputForm,
  },
  h4: {
    content: "This is an h4 tag",
    styles:
      "background-color: black; color: white; text-align: center; position: static; margin: 0; padding: 0;",
    defaultWidth: 3,
    defaultHeight: 1,
    editor: HeaderInputForm,
  },
  h5: {
    content: "This is an h5 tag",
    styles:
      "background-color: black; color: gray; text-align: center; position: static; margin: 0; padding: 0;",
    defaultWidth: 3,
    defaultHeight: 1,
    editor: HeaderInputForm,
  },
  h6: {
    content: "This is an h6 tag",
    styles:
      "background-color: black; color: dimgray; text-align: center; position: static; margin: 0; padding: 0;",
    defaultWidth: 3,
    defaultHeight: 1,
    editor: HeaderInputForm,
  },
  footer: {
    content: "© 2025 Your Company",
    styles: "background-color: #222; color: #ccc; text-align: center;",
    defaultWidth: 6,
    defaultHeight: 2,
    editor: FooterInputForm,
  },
  nav: {
    content:
      "<a href='#'>Home</a> | <a href='#'>About</a> | <a href='#'>Contact</a>",
    styles: "background-color: #333; color: white; text-align: center;",
    defaultWidth: 6,
    defaultHeight: 2,
    editor: NavInputForm,
  },
  ul: {
    content: "<li>Item 1</li><li>Item 2</li><li>Item 3</li>",
    styles: "list-style-type: disc; background-color: white;",
    defaultWidth: 2,
    defaultHeight: 2,
    editor: UlInputForm,
  },
  button: {
    content: "Click Me",
    styles: "background-color: blue; color: white;",
    defaultWidth: 2,
    defaultHeight: 2,
    editor: ButtonInputForm,
  },
  a: {
    content: "Google",
    styles: "background: white; color: blue;",
    defaultWidth: 3,
    defaultHeight: 1,
    editor: AInputForm,
  },
};
