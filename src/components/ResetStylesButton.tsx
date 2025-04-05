import React from "react";
import Button from "./Button";
import {
  JSONGridState,
  DefineStyles,
  ElementDefinition,
} from "../types/canvasTypes";
import { styleObjectToCssString, parseStyleString } from "../utils";

interface Props {
  elementId: string;
  jsonGridState: JSONGridState;
  setJsonGridState: React.Dispatch<React.SetStateAction<JSONGridState>>;
  defaultElementProps: Record<string, ElementDefinition>;
}

const ResetStylesButton: React.FC<Props> = ({
  elementId,
  jsonGridState,
  setJsonGridState,
  defaultElementProps,
}) => {
  const handleReset = () => {
    const elementType = elementId.split(".")[0];
    const defaultStyles = defaultElementProps[elementType]?.styles ?? "";

    setJsonGridState((prev) => ({
      ...prev,
      styles: {
        ...prev.styles,
        [elementId]: defaultStyles,
      },
    }));
  };

  return <Button onClick={handleReset} label="Reset Styles to Default" />;
};

export default ResetStylesButton;
