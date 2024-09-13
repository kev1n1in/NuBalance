import React from "react";
import styled from "styled-components";

interface ButtonProps {
  label: string;
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({ label, onClick }) => {
  return <StyledButton onClick={onClick}>{label}</StyledButton>;
};

const StyledButton = styled.button`
  width: 200px;
  height: 50px;
  font-size: 16px;
  text-align: center;
  border: 1px solid #ccc;
  background-color: #fff;
  color: #000;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #f0f0f0;
  }
`;

export default Button;
