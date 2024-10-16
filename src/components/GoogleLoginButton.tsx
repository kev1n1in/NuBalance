import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { updateUserProfile } from "../firebase/firebaseServices";
import { signInWithGoogle } from "../firebase/firebaseAuth";
import styled from "styled-components";
import { UserCredential } from "firebase/auth";
import useAlert from "../hooks/useAlertMessage";

const GoogleLogin = () => {
  const { addAlert, AlertMessage } = useAlert();
  const navigate = useNavigate();

  const handleGoogleLoginClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    googleLogin(); // 調用 googleLogin 函數
  };

  const googleLetters = [
    { letter: "G", color: "#4285F4" },
    { letter: "o", color: "#EA4335" },
    { letter: "o", color: "#FBBC05" },
    { letter: "g", color: "#4285F4" },
    { letter: "l", color: "#34A853" },
    { letter: "e", color: "#EA4335" },
  ];

  const googleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        const accessToken = response.access_token;
        const userCredential: UserCredential = await signInWithGoogle(
          accessToken
        );
        const user = userCredential.user;
        await updateUserProfile(user);
        addAlert("Login successful");
        navigate("/userInfo");
      } catch (error) {
        console.error("Authentication with Firebase failed:", error);
      }
    },
    onError: (error) => {
      console.log("Login Failed", error);
    },
  });

  return (
    <>
      <AlertMessage />
      <GoogleButton onClick={handleGoogleLoginClick}>
        {googleLetters.map(({ letter, color }, index) => (
          <ColoredLetter key={index} color={color}>
            {letter}
          </ColoredLetter>
        ))}
      </GoogleButton>
    </>
  );
};

// 樣式化的 Google 登錄按鈕
const GoogleButton = styled.button`
  display: flex;
  position: relative;
  align-items: center;
  border-radius: 24px;
  padding: 10px 50px;
  border: 1px solid #fefefe;
  color: #333;
  font-size: 24px;
  font-weight: bold;
  text-transform: none;
  width: auto;
  max-width: 300px;
  justify-content: flex-start;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.3s ease;

  &:hover {
    transform: scale(1.2);
  }
`;

const ColoredLetter = styled.span<{ color: string }>`
  color: ${(prop) => prop.color};
  font-size: 24px;
  font-weight: bold;
`;

export default GoogleLogin;
