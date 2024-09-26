import React, { useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  onScrollToTop: () => void;
  scrollProgress: number; // 用來控制 SVG 標題的位置和大小
}

const Header: React.FC<HeaderProps> = ({ onScrollToTop, scrollProgress }) => {
  const navigate = useNavigate();

  // 監聽滾動事件，當滾動到頂部時觸發
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY === 0) {
        onScrollToTop();
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [onScrollToTop]);

  // 控制縮放和Y軸的位置
  const scaleValue = 3 - scrollProgress * 2; // 最大 3 倍縮放，最小 1 倍
  const translateY = Math.max(
    70,
    Math.round(
      window.innerHeight / 2 +
        300 -
        scrollProgress * (window.innerHeight / 2 + 100 - 70)
    )
  );

  // 避免縮放比例過小，並確保動畫順暢
  const smoothScroll = `translateY(${
    translateY - window.innerHeight / 2 + 100
  }px) scale(${scaleValue})`;

  // 根據滾動進度設置是否固定
  const isFixed = scrollProgress >= 1;

  return (
    <Wrapper isFixed={isFixed}>
      <h1 className="header-logo">
        <svg
          width="400"
          height="200"
          viewBox="0 0 400 200"
          style={{
            overflow: "visible",
            transformOrigin: "center",
            transform: smoothScroll,
            transition: "transform 0.1s linear", // 使用 linear 確保滾動即時同步
          }}
        >
          <text
            x="50%"
            y="50%"
            dominantBaseline="middle"
            textAnchor="middle"
            fill="black"
            fontSize="72"
          >
            NuBalance
          </text>
        </svg>
      </h1>
    </Wrapper>
  );
};

// 使用 props 來動態設置 CSS
const Wrapper = styled.div<{ isFixed: boolean }>`
  display: flex;
  position: ${(props) =>
    props.isFixed ? "fixed" : "absolute"}; // 動態設置 position
  top: ${(props) => (props.isFixed ? "0" : "unset")}; // 當固定時設置在頂部
  width: 100%;
  height: 140px;
  justify-content: center;
  align-items: center;
  background-color: transparent;
  z-index: 10;
`;

export default Header;
