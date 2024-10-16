import React, { useRef, useLayoutEffect, useState, useCallback } from "react";
import rough from "roughjs/bin/rough";
import triangleIndicator from "./triangleIndicator.png";
import redTriangle from "./redTriangle.png";

interface HandDrawnProgressProps {
  percentage: number;
  height?: number;
  strokeColor?: string;
  fillColor?: string;
}

const HandDrawnProgress: React.FC<HandDrawnProgressProps> = ({
  percentage,
  height = 30,
  strokeColor = "green",
  fillColor = "lightgreen",
}) => {
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
          (effectivePercentage / 100) * (canvas.width - 20), // 使用有效百分比
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
        // 延遲執行邏輯
        if (containerRef.current) {
          const newWidth = containerRef.current.offsetWidth;
          if (newWidth !== canvasWidth) {
            setCanvasWidth(newWidth);
            if (canvasRef.current) {
              canvasRef.current.width = newWidth;
              requestAnimationFrame(updateCanvas); // 確保畫面更新是平滑的
            }
          }
        }
      }, 200); // 延遲200ms，您可以根據需要調整這個數值
    };

    handleResize(); // 初始化時更新一次寬度
    window.addEventListener("resize", handleResize); // 當螢幕寬度改變時，更新寬度
    console.log("現在寬度", canvasWidth);
    return () => window.removeEventListener("resize", handleResize); // 清理事件
  }, [canvasWidth, updateCanvas]);

  useLayoutEffect(() => {
    updateCanvas(); // 確保初次加載和尺寸變更後重新繪製
  }, [updateCanvas]);

  return (
    <div ref={containerRef} style={{ width: "100%" }}>
      <canvas ref={canvasRef} height={height + 40}></canvas>
    </div>
  );
};

export default HandDrawnProgress;
