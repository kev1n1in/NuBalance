import ReactDOM from "react-dom";
import styled from "styled-components";
import CloseImg from "../../asset/close.png";
import { ModalProps } from "../../types/Modals";

const Modal = ({ title, onClose, children }: ModalProps) => {
  return ReactDOM.createPortal(
    <Wrapper onClick={onClose}>
      <Content onClick={(e) => e.stopPropagation()}>
        <Header>
          <HeaderContainer>
            <Title>{title}</Title>
            <CloseButton src={CloseImg} onClick={onClose} />
          </HeaderContainer>
        </Header>
        {children}
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
  padding-bottom: 20px;
  border-radius: 8px;
  height: 90vh;
  overflow-y: auto;
  width: 768px;
  max-width: 100%;
  &::-webkit-scrollbar {
    display: none;
  }
  @media (max-width: 768px) {
    width: 95%;
  }
`;
const HeaderContainer = styled.div`
  position: relative;
`;
const Header = styled.div`
  position: fixed;
  width: 768px;
  padding: 20px 0;
  background-color: #fff;
  z-index: 2;
  @media (max-width: 768px) {
    width: 95%;
  }
`;

const Title = styled.h1`
  text-align: center;
  @media (max-width: 480px) {
    font-size: 24px;
  }
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
