import { useState } from "react";
import styled from "styled-components";

interface HamburgerIconProps {
  onClick: () => void;
}

const HamburgerIcon = ({ onClick }: HamburgerIconProps) => {
  const [active, setActive] = useState(false);

  const toggleMenu = () => {
    setActive(!active);
    onClick();
  };
  const isRootPath = location.pathname === "/";

  return (
    <Svg
      viewBox="0 0 100 100"
      width="80"
      onClick={toggleMenu}
      active={active}
      isRoot={isRootPath}
    >
      <Path
        className="line top"
        d="m 30,33 h 40 c 3.722839,0 7.5,3.126468 7.5,8.578427 0,5.451959 -2.727029,8.421573 -7.5,8.421573 h -20"
        active={active}
      />
      <Path className="line middle" d="m 30,50 h 40" active={active} />
      <Path
        className="line bottom"
        d="m 70,67 h -40 c 0,0 -7.5,-0.802118 -7.5,-8.365747 0,-7.563629 7.5,-8.634253 7.5,-8.634253 h 20"
        active={active}
      />
    </Svg>
  );
};

const Svg = styled.svg<{ active: boolean; isRoot: boolean }>`
  display: ${({ isRoot }) => (isRoot ? "flex" : "none")};
  position: absolute;
  right: ${({ isRoot }) => (isRoot ? "auto" : "0")};
  left: ${({ isRoot }) => (isRoot ? "40px" : "0")};
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: transform 400ms;
  user-select: none;
  transform: ${({ active }) => (active ? "rotate(45deg)" : "none")};
  z-index: 11;
  @media (max-width: 1000px) {
    display: flex;
    left: auto;
    right: 40px;
  }
`;

const Path = styled.path<{ active: boolean }>`
  fill: none;
  transition: stroke-dasharray 400ms, stroke-dashoffset 400ms;
  stroke: ${({ active }) => (active ? "white" : "black")};
  stroke-width: 5.5;
  stroke-linecap: round;

  &.top {
    stroke-dasharray: 40 160;
    stroke-dashoffset: ${({ active }) => (active ? "-64px" : "0")};
  }
  &.middle {
    stroke-dasharray: 40 142;
    transform-origin: 50%;
    transition: transform 400ms;
    transform: ${({ active }) => (active ? "rotate(90deg)" : "none")};
  }
  &.bottom {
    stroke-dasharray: 40 85;
    stroke-dashoffset: ${({ active }) => (active ? "-64px" : "0")};
    transform-origin: 50%;
    transition: transform 400ms, stroke-dashoffset 400ms;
  }
`;

export default HamburgerIcon;
