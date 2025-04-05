import Button from "./Button";
import { Cell, JSONGridState } from "../types/canvasTypes";

interface DeleteButtonProps {
  elementId: string;
  gridState: (Cell | null)[][];
  setGridState: React.Dispatch<React.SetStateAction<(Cell | null)[][]>>;
  jsonGridState: JSONGridState;
  setJsonGridState: React.Dispatch<React.SetStateAction<JSONGridState>>;
  setActiveEditor: React.Dispatch<
    React.SetStateAction<{ id: string; type: string } | null>
  >;
  saveAllStateToLocalStorage: Function;
  instanceCounters: object;
  draggedElement: object | null;
}

const DeleteElementButton: React.FC<DeleteButtonProps> = ({
  elementId,
  gridState,
  setGridState,
  jsonGridState,
  setJsonGridState,
  setActiveEditor,
  saveAllStateToLocalStorage,
  instanceCounters,
  draggedElement,
}) => {
  const handleDelete = () => {
    const newGrid = gridState.map((row, r) =>
      row.map((cell, c) => {
        if (cell && jsonGridState.layout[r][c] === elementId) {
          return null;
        }
        return cell;
      })
    );

    const newContent = { ...jsonGridState.content };
    const newStyles = { ...jsonGridState.styles };
    delete newContent[elementId];
    delete newStyles[elementId];

    const newLayout = jsonGridState.layout.map((row) =>
      row.map((id) => (id === elementId ? "" : id))
    );

    const updatedJsonGridState: JSONGridState = {
      ...jsonGridState,
      layout: newLayout,
      content: newContent,
      styles: newStyles,
    };

    setGridState(newGrid);
    setJsonGridState(updatedJsonGridState);
    setActiveEditor(null);

    // ✅ Use the freshly computed values
    saveAllStateToLocalStorage(
      newGrid,
      updatedJsonGridState,
      draggedElement,
      instanceCounters
    );
  };

  return <Button onClick={handleDelete} label="Delete Element" />;
};

export default DeleteElementButton;
