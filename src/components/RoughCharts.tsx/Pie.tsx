import React, { useEffect, useRef } from "react";
import { Pie } from "rough-viz";
import styled from "styled-components";

interface RoughPieChartProps {
  data: { labels: string[]; values: number[] };
}

const RoughPieChart: React.FC<RoughPieChartProps> = ({ data }) => {
  const chartRef = useRef<HTMLDivElement | null>(null);

  // 計算百分比的函數
  const calculatePercentages = (values: number[]) => {
    const total = values.reduce((acc, value) => acc + value, 0);
    return values.map((value) => ((value / total) * 100).toFixed(2)); // 保留小數點後兩位
  };

  useEffect(() => {
    const adjustPieChart = () => {
      if (chartRef.current) {
        chartRef.current.innerHTML = "";

        const width = chartRef.current.clientWidth;
        const height = chartRef.current.clientHeight;

        let bottomMargin, translateX, translateY, viewBoxX, viewBoxY;

        // 設置不同寬度下的邊距和位移
        if (window.innerWidth < 360) {
          bottomMargin = 0;
          translateX = -50; // 左右調整
          translateY = 0;
          viewBoxX = -100; // 增加 viewBox 寬度以給 tooltip 空間
          viewBoxY = 10;
        } else if (window.innerWidth < 480) {
          bottomMargin = 0;
          translateX = -50; // 左右調整
          translateY = 0;
          viewBoxX = -100;
          viewBoxY = 200;
        } else if (window.innerWidth < 768) {
          bottomMargin = 20;
          translateX = -50; // 左右調整
          translateY = 0;
          viewBoxX = -100;
          viewBoxY = 10;
        } else if (window.innerWidth < 1000) {
          bottomMargin = 120;
          translateX = -100; // 左右調整
          translateY = -50;
          viewBoxX = -150;
          viewBoxY = -50;
        } else if (window.innerWidth < 1280) {
          bottomMargin = 0;
          translateX = -100; // 左右調整
          translateY = 0;
          viewBoxX = -100;
          viewBoxY = 50;
        } else {
          bottomMargin = 0;
          translateX = -100; // 左右調整
          translateY = 0;
          viewBoxX = -100;
          viewBoxY = -100;
        }

        // 計算百分比後的資料
        const percentageValues = calculatePercentages(data.values);

        const pieChart = new Pie({
          element: `#${chartRef.current.id}`,
          data: {
            labels: data.labels,
            values: percentageValues, // 使用百分比數值
          },
          roughness: 2,
          colors: ["#36A2EB", "#FFCE56", "#4BC0C0"],
          stroke: "black",
          strokeWidth: 2,
          width: width,
          height: height,
          tooltipFontSize: "1.2rem",
          margin: { top: 0, right: 20, bottom: 100, left: 20 },
        });

        setTimeout(() => {
          if (chartRef.current) {
            const svg = chartRef.current.querySelector("svg");
            const roughPieChart =
              chartRef.current.querySelector("g.roughpie-chart");

            if (roughPieChart && svg) {
              roughPieChart.setAttribute(
                "transform",
                `translate(${translateX}, ${translateY})`
              );
              const viewBoxValue = `${viewBoxX} ${viewBoxY} ${
                width + 200
              } ${height}`;
              svg.setAttribute("viewBox", viewBoxValue); // 調整 viewBox 的寬度
              svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
              const legend = svg.querySelector("g.roughpie-chart");
              if (legend) {
                // 對 legend 進行縮放
                legend.setAttribute(
                  "transform",
                  "translate(-1000,-30) scale(2)"
                ); // 調整 scale 值可以改變圖例大小
              }
            }
          }
        }, 100);
      }
    };

    window.addEventListener("resize", adjustPieChart);

    adjustPieChart();

    return () => {
      window.removeEventListener("resize", adjustPieChart);
    };
  }, [data]);

  return (
    <ChartContainer>
      <ChartWrapper ref={chartRef} id="pie-chart" />
    </ChartContainer>
  );
};

const ChartContainer = styled.div`
  width: 100%;
  padding-bottom: 55%;
  position: relative;
`;

const ChartWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  @media (max-width: 768px) {
    padding-top: 0;
  }
`;

export default RoughPieChart;
