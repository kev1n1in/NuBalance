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
}

const Button: React.FC<ButtonProps> = ({
  label,
  onClick,
  disabled,
  margin,
  color = "black",
  backgroundColor = "#fff",
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
        stroke: "white",
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

const StyledButton = styled.button<{ backgroundColor?: string }>`
  position: relative;
  background: ${(props) => props.backgroundColor};
  border: none;
  padding: 0;
  cursor: pointer;
  outline: none;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 60px;
  font-size: 16px;
  text-align: center;
  transition: background-color 0.3s ease;

  &:hover canvas {
    filter: drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.2));
  }

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
`;

export default Button;
