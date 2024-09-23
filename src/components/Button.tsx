import React from "react";
import styled from "styled-components";

interface ButtonProps {
  label: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  margin?: string;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  label,
  onClick,
  disabled,
  margin,
}) => {
  return (
    <StyledButton disabled={disabled} onClick={onClick} margin={margin}>
      {label}
    </StyledButton>
  );
};

const StyledButton = styled.button<{ margin?: string }>`
  width: 100%;
  height: 50px;
  font-size: 16px;
  text-align: center;
  border: 1px solid #ccc;
  background-color: #fff;
  color: #000;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin: ${(props) => props.margin || "0"};

  &:hover {
    background-color: #f0f0f0;
  }
`;

export default Button;
