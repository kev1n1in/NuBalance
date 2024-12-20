import styled from "styled-components";
import { OverlayProps } from "../types/Sidebar";

const Overlay = ({ onClick }: OverlayProps) => {
  return <OverlayWrapper onClick={onClick} />;
};

const OverlayWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 5;
`;
export default Overlay;
