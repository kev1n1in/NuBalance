import React, { useRef, useEffect, useState } from "react";
import rough from "roughjs/bin/rough";

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

  // 獲取容器的寬度，並更新畫布寬度
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setCanvasWidth(containerRef.current.offsetWidth);
      }
    };

    // 初始化時設置一次寬度
    updateWidth();

    // 當窗口大小改變時，更新寬度
    window.addEventListener("resize", updateWidth);
    return () => {
      window.removeEventListener("resize", updateWidth);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const rc = rough.canvas(canvas);

        // 清空畫布
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 繪製背景矩形
        rc.rectangle(10, 10, canvasWidth - 20, height, {
          stroke: "gray",
          strokeWidth: 2,
          roughness: 2, // 使邊緣更顯手繪感
        });

        // 繪製進度矩形
        rc.rectangle(10, 10, (percentage / 100) * (canvasWidth - 20), height, {
          fill: fillColor,
          fillStyle: "hachure", // 手繪風格填充
          stroke: strokeColor,
          strokeWidth: 2,
          roughness: 1.5, // 使邊緣有手繪風格
        });
      }
    }
  }, [percentage, height, strokeColor, fillColor, canvasWidth]);

  return (
    <div ref={containerRef} style={{ width: "100%" }}>
      <canvas ref={canvasRef} width={canvasWidth} height={height + 20}></canvas>
    </div>
  );
};

export default HandDrawnProgress;
