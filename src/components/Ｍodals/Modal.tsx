import React from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";
import CloseImg from "../../asset/close.png";
import { c } from "vite/dist/node/types.d-aGj9QkWt";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode; // 確保這裡定義了 children
}

const Modal: React.FC<ModalProps> = ({ title, onClose, children }) => {
  return ReactDOM.createPortal(
    <Wrapper onClick={onClose}>
      <Content onClick={(e) => e.stopPropagation()}>
        <Header>
          <HeaderContainer>
            <Title>{title}</Title>
            <CloseButton src={CloseImg} onClick={onClose} />
          </HeaderContainer>
        </Header>
        {children} {/* 顯示傳入的內容 */}
      </Content>
    </Wrapper>,
    document.getElementById("modal-root")!
  );
};

const Wrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;

  z-index: 1000;
`;

const Content = styled.div`
  position: relative;
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  height: 90vh;
  overflow-y: auto;
  width: 768px;
  max-width: 100%;
  &::-webkit-scrollbar {
    display: none;
  }
`;
const Header = styled.div`
  position: fixed;
  width: 728px;
  padding: 0 20px;
`;
const HeaderContainer = styled.div`
  position: relative;
`;
const Title = styled.h1`
  text-align: center;
`;
const CloseButton = styled.img`
  display: flex;
  position: absolute;
  width: 24px;
  height: 24px;
  top: 50%;
  right: 40px;
  z-index: 1001;
  transform: translateY(-50%);
  cursor: pointer;
`;

export default Modal;
