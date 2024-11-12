import { useEffect, useRef } from "react";
import rough from "roughjs/bin/rough";
import styled from "styled-components";
import { ButtonProps } from "../types/GlobalComponents";

const Button = ({
  label,
  onClick,
  disabled,
  margin,
  color = "black",
  strokeColor = "white",
  backgroundColor = "#fff",
  justifyContent = "center",
  icon,
}: ButtonProps) => {
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
        <ContentWrapper>
          {icon && <Icon src={icon} />}
          <Label color={color}>{label}</Label>
        </ContentWrapper>
      </StyledButton>
    </ButtonWrapper>
  );
};

const ButtonWrapper = styled.div<{ margin?: string }>`
  display: inline-block;
  width: 100%;
  margin: ${(props) => props.margin || "0"};
`;

const ContentWrapper = styled.div`
  display: flex;
  align-items: center;
  z-index: 2;
  transition: 0.3s;
  &:hover {
    transform: scale(1.1);
  }
`;

const Icon = styled.img`
  width: 24px;
  height: 24px;
  margin-right: 4px;
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
  font-size: 16px;
  font-weight: bold;
  color: ${(props) => props.color};
`;

export default Button;
