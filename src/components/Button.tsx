import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import rough from "roughjs/bin/rough";

interface ButtonProps {
  label: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  margin?: string;
  disabled?: boolean;
  color?: string;
  backgroundColor?: string;
  strokeColor?: string;
  justifyContent?: "flex-start" | "center" | "flex-end";
}

const Button: React.FC<ButtonProps> = ({
  label,
  onClick,
  disabled,
  margin,
  color = "black",
  strokeColor = "white",
  backgroundColor = "#fff",
  justifyContent = "center",
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (canvasRef.current && buttonRef.current) {
      const canvas = canvasRef.current;
      const rc = rough.canvas(canvas);
      const button = buttonRef.current;

      canvas.width = button.offsetWidth;
      canvas.height = button.offsetHeight;

      const ctx = canvas.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);

      rc.rectangle(5, 5, canvas.width - 10, canvas.height - 10, {
        roughness: 2,
        stroke: strokeColor,
        strokeWidth: 2,
        bowing: 1.5,
      });
    }
  }, [canvasRef, buttonRef]);

  return (
    <ButtonWrapper margin={margin}>
      <StyledButton
        ref={buttonRef}
        disabled={disabled}
        onClick={onClick}
        backgroundColor={backgroundColor}
        justifyContent={justifyContent}
      >
        <canvas ref={canvasRef}></canvas>
        <Label color={color}>{label}</Label>
      </StyledButton>
    </ButtonWrapper>
  );
};

const ButtonWrapper = styled.div<{ margin?: string }>`
  display: inline-block;
  width: 100%;
  margin: ${(props) => props.margin || "0"};
`;

const StyledButton = styled.button<{
  backgroundColor?: string;
  justifyContent?: string;
}>`
  position: relative;
  background: ${(props) => props.backgroundColor};
  border: none;
  padding: 0;
  cursor: pointer;
  outline: none;
  display: flex;
  justify-content: ${(props) => props.justifyContent};
  align-items: center;
  width: 100%;
  height: 60px;
  font-size: 16px;
  text-align: center;
  transition: background-color 0.3s ease;

  canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
  }
`;

const Label = styled.span<{ color?: string }>`
  position: absolute;
  z-index: 2;
  font-size: 16px;
  font-weight: bold;
  color: ${(props) => props.color};
  transition: 0.3s;
  &:hover {
    transform: scale(1.1);
  }
`;

export default Button;
