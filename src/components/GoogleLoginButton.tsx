// src/components/GoogleLoginButton.tsx
import React from "react";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import styled from "styled-components";

interface GoogleLoginButtonProps {
  onSuccess: (response: CredentialResponse) => void;
  onError: () => void;
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  onSuccess,
  onError,
}) => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  return (
    <StyledButtonContainer>
      <GoogleLogin
        onSuccess={(response: CredentialResponse) => {
          onSuccess(response);
        }}
        onError={onError}
      />
    </StyledButtonContainer>
  );
};

const StyledButtonContainer = styled.div`
  button {
    background-color: #4285f4;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;

    &:hover {
      background-color: #357ae8;
    }

    img {
      width: 20px;
      height: 20px;
    }
  }
`;

export default GoogleLoginButton;
