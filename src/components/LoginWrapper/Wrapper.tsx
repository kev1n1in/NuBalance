import styled from "styled-components";
import { ImageInfo, Position } from "../../types/GSAP";
import avocado from "./avocado.png";
import cheese from "./cheese.png";
import meat from "./meat.png";
import tomato from "./tomato.png";
import veg from "./veg.png";

const images: { [key: string]: ImageInfo } = {
  tomato: {
    src: tomato,
    position: { bottom: "100px", right: "40px" },
    size: { width: "200px", height: "auto" },
  },
  meat: {
    src: meat,
    position: { top: "50px", left: "50px" },
    size: { width: "180px", height: "auto" },
  },
  cheese: {
    src: cheese,
    position: { bottom: "100px", left: "200px" },
    size: { width: "180px", height: "auto" },
  },
  veg: {
    src: veg,
    position: { top: "350px", left: "450px" },
    size: { width: "160px", height: "auto" },
  },
  avocado: {
    src: avocado,
    position: { top: "170px", right: "160px" },
    size: { width: "180px", height: "auto" },
  },
};

const ImagesComponent = () => (
  <Wrapper>
    {Object.keys(images).map((key) => (
      <StyledImage
        key={key}
        src={images[key].src}
        position={images[key].position}
        size={images[key].size}
        alt={key}
      />
    ))}
  </Wrapper>
);
const Wrapper = styled.div`
  position: relative;
  width: 100%;
`;
const StyledImage = styled.img<{
  position: Position;
  size: { width: string; height: string };
}>`
  position: absolute;
  top: ${(props) => props.position.top || "auto"};
  left: ${(props) => props.position.left || "auto"};
  right: ${(props) => props.position.right || "auto"};
  bottom: ${(props) => props.position.bottom || "auto"};
  width: ${(props) => props.size.width};
  height: ${(props) => props.size.height};
`;
export default ImagesComponent;
