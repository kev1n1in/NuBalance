import styled, { keyframes } from "styled-components";
import { AlertMessageProp } from "../types/GlobalComponents";

const AlertMessage = ({ message }: AlertMessageProp) => {
  if (!message) return null;
  return <AlertContainer>{message}</AlertContainer>;
};

export default AlertMessage;

const slideIn = keyframes`
  0% {
    transform: translateX(-50%) translateY(-100%);
    opacity: 0;
  }
  100% {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  0% {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
  100% {
    transform: translateX(-50%) translateY(-100%);
    opacity: 0;
  }
`;

const AlertContainer = styled.div`
  position: fixed;
  top: 10%;
  left: 50%;
  transform: translateX(-50%);
  background-color: #fff;
  color: black;
  padding: 16px 24px;
  border-radius: 8px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
  z-index: 1000;
  font-size: 16px;
  font-weight: bold;
  animation: ${slideIn} 0.5s ease-out, ${slideOut} 0.5s ease-in 0.75s forwards;
`;
