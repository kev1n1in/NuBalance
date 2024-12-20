import { useCallback, useLayoutEffect, useRef, useState } from "react";
import rough from "roughjs/bin/rough";
import { HandDrawnProgressProps } from "../../types/Diary";
import redTriangle from "./redTriangle.png";
import triangleIndicator from "./triangleIndicator.png";

const HandDrawnProgress = ({
  percentage,
  height = 30,
  strokeColor = "green",
  fillColor = "lightgreen",
}: HandDrawnProgressProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [canvasWidth, setCanvasWidth] = useState<number>(0);

  const effectivePercentage = Math.min(percentage, 100);
  const effectiveFillColor = percentage > 100 ? "red" : fillColor;
  const effectiveStrokeColor = percentage > 100 ? "darkred" : strokeColor;
  const effectiveIndicator = percentage > 100 ? redTriangle : triangleIndicator;

  const updateCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const rc = rough.canvas(canvas);
        rc.rectangle(10, 30, canvas.width - 20, height, {
          stroke: "gray",
          strokeWidth: 1,
          roughness: 2,
        });

        rc.rectangle(
          10,
          30,
          (effectivePercentage / 100) * (canvas.width - 20),
          height,
          {
            fill: effectiveFillColor,
            fillStyle: "hachure",
            stroke: effectiveStrokeColor,
            strokeWidth: 3,
            roughness: 1.5,
          }
        );

        const indicatorPosition = Math.max(
          0,
          Math.min(
            (percentage / 100) * (canvas.width - 20) + 10 - 12,
            canvas.width - 24
          )
        );

        const img = new Image();
        img.src = effectiveIndicator;
        img.onload = () => {
          ctx.drawImage(img, indicatorPosition, 5, 24, 24);
        };
      }
    }
  }, [
    percentage,
    height,
    effectiveFillColor,
    effectiveStrokeColor,
    effectiveIndicator,
    canvasWidth,
  ]);

  useLayoutEffect(() => {
    const handleResize = () => {
      setTimeout(() => {
        if (containerRef.current) {
          const newWidth = containerRef.current.offsetWidth;
          if (newWidth !== canvasWidth) {
            setCanvasWidth(newWidth);
            if (canvasRef.current) {
              canvasRef.current.width = newWidth;
              requestAnimationFrame(updateCanvas);
            }
          }
        }
      }, 200);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [canvasWidth, updateCanvas]);

  useLayoutEffect(() => {
    updateCanvas();
  }, [updateCanvas]);

  return (
    <div ref={containerRef} style={{ width: "100%" }}>
      <canvas ref={canvasRef} height={height + 40}></canvas>
    </div>
  );
};

export default HandDrawnProgress;
