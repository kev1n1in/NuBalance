import React from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";
import CloseImg from "../asset/close.png";

interface ModalProps {
  onClose: () => void;
  children: React.ReactNode; // 確保這裡定義了 children
}

const Modal: React.FC<ModalProps> = ({ onClose, children }) => {
  return ReactDOM.createPortal(
    <Wrapper onClick={onClose}>
      <Content onClick={(e) => e.stopPropagation()}>
        <CloseButton src={CloseImg} onClick={onClose} />
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
  width: 400px;
  max-width: 100%;
`;

const CloseButton = styled.img`
  position: absolute;
  width: 24px;
  height: 24px;
  top: 10px;
  right: 10px;
  cursor: pointer;
`;

export default Modal;
