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
}

const DeleteElementButton: React.FC<DeleteButtonProps> = ({
  elementId,
  gridState,
  setGridState,
  jsonGridState,
  setJsonGridState,
  setActiveEditor,
}) => {
  const handleDelete = () => {
    // 1) Remove from gridState
    setGridState((prevGrid) => {
      const newGrid = prevGrid.map((row, r) =>
        row.map((cell, c) => {
          if (cell && jsonGridState.layout[r][c] === elementId) {
            return null;
          }
          return cell;
        })
      );

      // 2) Remove content/styles + fix layout
      setJsonGridState((prev) => {
        const newContent = { ...prev.content };
        const newStyles = { ...prev.styles };
        delete newContent[elementId];
        delete newStyles[elementId];

        const newLayout = prev.layout.map((row) =>
          row.map((id) => (id === elementId ? "" : id))
        );

        return {
          ...prev,
          layout: newLayout,
          content: newContent,
          styles: newStyles,
        };
      });

      // 3) Clear active editor if this is the one being edited
      setActiveEditor(null);

      return newGrid;
    });
  };

  return <Button onClick={handleDelete} label="Delete Element" />;
};

export default DeleteElementButton;
