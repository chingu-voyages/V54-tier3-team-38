import { Button as MuiButton } from "@mui/material";

interface ButtonProps {
  label: string;
  onClick: () => void;
}

const Button: React.FC<ButtonProps> = ({ label, onClick }) => {
  return <MuiButton onClick={onClick}>{label}</MuiButton>;
};

export default Button;
