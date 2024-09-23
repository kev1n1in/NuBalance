import { useState, useEffect } from "react";
import opentype from "opentype.js";
import { RoughSVG } from "react-rough-fiber";

interface HandwrittenTextProps {
  text: string | number;
  fill?: string;
  roughness?: number;
  fillStyle?: string;
  color?: string;
  fontSize?: number;
}

const HandwrittenText = ({
  text,
  roughness = 0.1,
  fill = "gray",
  fillStyle = "hachure",
  color = "black",
  fontSize = 100, // 字體大小設置為100px
}: HandwrittenTextProps) => {
  const [paths, setPaths] = useState<string[]>([]);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    let ignore = false;
    const loadFont = async () => {
      try {
        const res = await fetch(
          "https://fonts.gstatic.com/s/caveat/v17/WnznHAc5bAfYB2QRah7pcpNvOx-pjcB9eIWpZw.woff"
        );
        const buffer = await res.arrayBuffer();
        if (ignore) return;
        const font = opentype.parse(buffer);
        const fontPaths = font
          .getPaths(text, 0, 100, fontSize)
          .map((path: { toPathData: () => string }) => path.toPathData());
        const textWidth = font.getAdvanceWidth(text, fontSize); // 使用原始 fontSize 計算寬度
        const textHeight = fontSize * 1.2; // 將高度設為字體大小的 1.2 倍
        setPaths(fontPaths);
        setWidth(textWidth);
        setHeight(textHeight);
      } catch (error) {
        console.error("Error loading font:", error);
      }
    };
    loadFont();
    return () => {
      ignore = true;
    };
  }, [text, fontSize]);

  return (
    <RoughSVG style={{ color }} options={{ roughness, fillStyle }}>
      <svg
        style={{
          width: `${width}px`,
          height: `${height}px`,
        }}
        viewBox={`0 0 ${width * 1.2} ${Math.max(200, fontSize * 1.2)}`}
        fill={fill}
        stroke={color}
      >
        {paths.map((d, i) => (
          <path d={d} key={i} />
        ))}
      </svg>
    </RoughSVG>
  );
};

export default HandwrittenText;
