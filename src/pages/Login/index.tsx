import { useState, useEffect, MouseEvent } from "react";
import {
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
} from "../../firebase/firebaseAuth";
import { onAuthStateChanged, User } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { auth } from "../../firebase/firebaseConfig";
import GoogleLoginButton from "../../components/GoogleLoginButton";
import styled from "styled-components";
import { CredentialResponse, GoogleOAuthProvider } from "@react-oauth/google";
import Button from "../../components/Button";
import { updateUserProfile } from "../../firebase/firebaseServices";
import BGI from "../../asset/draft.png";
import emailIcon from "./email.png";
import passwordIcon from "./password.png";
import userIcon from "./user.png";
import HamburgerIcon from "../../components/MenuButton";
import Overlay from "../../components/Overlay";
import Sidebar from "../../components/Sidebar";
import RequiredMark from "../../components/RequiredMark";
import useAlert from "../../hooks/useAlertMessage";
import StickerWrapper from "../../components/LoginWrapper/Wrapper";

const Login = () => {
  const [user, setUser] = useState<User | null>(null);
  const [inputUser, setInputUser] = useState("");
  const [inputEmail, setInputEmail] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [toggleMenu, setToggleMenu] = useState<boolean>(false);
  const [messages, setMessages] = useState<string[]>([]);
  const navigate = useNavigate();
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const { addAlert, AlertMessage } = useAlert();

  useEffect(() => {
    const loggedIn = Cookies.get("isLoggedIn");

    if (loggedIn === "true") {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        Cookies.set("isLoggedIn", "true", { expires: 7 });
        console.log("Logged in as:", currentUser.email);
      } else {
        setUser(null);
        Cookies.remove("isLoggedIn");
        console.log("User logged out");
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    try {
      const user: User = await signInWithEmail(inputEmail, inputPassword);
      console.log("Login Success:", user);

      if (user) {
        await updateUserProfile(user, inputEmail);

        Cookies.set("username", user.email || "User", { expires: 7 });
        Cookies.set("isLoggedIn", "true", { expires: 7 });
        setIsLoggedIn(true);
        addAlert("登入成功！！");
        setTimeout(() => {
          navigate("/userInfo");
        }, 1000);
      } else {
        addAlert("User is not logged in. Please log in first.");
      }
    } catch (error: any) {
      addAlert("Login failed. Please try again.");
      console.error("Login failed:", error);
    }
  };
  const handleInputChange =
    (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
      removeMessage();
    };

  const handleSignUp = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const fields = [
      { value: inputUser, name: "UserName" },
      { value: inputEmail, name: "Email" },
      { value: inputPassword, name: "Password" },
    ];

    const missingFields = fields
      .filter((field) => !field.value)
      .map((field) => field.name);

    if (missingFields.length > 0) {
      addAlert(`請填寫以下欄位: ${missingFields.join(", ")}`);
      return;
    }

    try {
      const newUser = await signUpWithEmail(
        inputEmail,
        inputPassword,
        inputUser
      );
      console.log("Sign Up Success:", newUser);
      addAlert("註冊成功！請使用您的帳號登入。");

      setIsSignUp(false);
    } catch (error: any) {
      addAlert(`註冊失敗: ${error.message}`);
      console.error("Sign Up failed:", error);
    }
  };

  const removeMessage = () => {
    setMessages((prevMessages) => prevMessages.slice(1)); // 每次移除 array 中的第一個訊息
  };

  useEffect(() => {
    if (messages.length > 0) {
      const timer = setTimeout(() => {
        removeMessage(); // 自動移除訊息
      }, 10);

      return () => clearTimeout(timer); // 清除計時器避免 memory leak
    }
  }, [messages]);

  const handleMenuToggle = () => {
    setToggleMenu((prev) => !prev);
  };
  return (
    <>
      <AlertMessage />
      {isLoggedIn && (
        <>
          {toggleMenu && <Overlay onClick={handleMenuToggle} />}
          <HamburgerIcon onClick={handleMenuToggle} />
          <Sidebar toggleMenu={toggleMenu} />
        </>
      )}
      <GoogleOAuthProvider clientId={clientId}>
        <Wrapper>
          <StickerWrapper />
          <LoginWrapper>
            {!isLoggedIn && (
              <LoginContainer>
                <Form>
                  <EmailLoginContainer>
                    <Title>{isSignUp ? "SignUp" : "LogIn"}</Title>
                    <UsernameContainer isVisible={isSignUp}>
                      <InputTitle>
                        UserName
                        <RequiredMark />
                      </InputTitle>
                      <InputContainer>
                        <InputIcon src={userIcon}></InputIcon>
                        <Input
                          type="text"
                          value={inputUser}
                          onChange={(e) => setInputUser(e.target.value)}
                          placeholder="your name"
                        />
                      </InputContainer>
                    </UsernameContainer>
                    <InputTitle>
                      Email
                      <RequiredMark />
                    </InputTitle>
                    <InputContainer>
                      <InputIcon src={emailIcon}></InputIcon>
                      <Input
                        type="email"
                        value={inputEmail}
                        onChange={(e) => setInputEmail(e.target.value)}
                        placeholder="admin@1.com"
                      />
                    </InputContainer>
                    <InputTitle>
                      Password
                      <RequiredMark />
                    </InputTitle>
                    <InputContainer>
                      <InputIcon src={passwordIcon}></InputIcon>
                      <InputIcon></InputIcon>
                      <Input
                        type="password"
                        value={inputPassword}
                        onChange={(e) => setInputPassword(e.target.value)}
                        placeholder="123456"
                      />
                    </InputContainer>
                    <ButtonContainer>
                      <Button
                        color="white"
                        backgroundColor="black"
                        label={isSignUp ? "Sign Up" : "Log in"}
                        onClick={isSignUp ? handleSignUp : handleLogin}
                      />
                    </ButtonContainer>
                    <Split>
                      <SplitText>OR</SplitText>
                    </Split>
                    <GoogleButtonContainer>
                      <GoogleLoginButton />
                    </GoogleButtonContainer>
                    <SignUpText>
                      {isSignUp ? (
                        <>
                          Have an account?
                          <SignUpLink onClick={() => setIsSignUp(false)}>
                            Log in
                          </SignUpLink>
                        </>
                      ) : (
                        <>
                          Don't have an account?
                          <SignUpLink onClick={() => setIsSignUp(true)}>
                            Create account
                          </SignUpLink>
                        </>
                      )}
                    </SignUpText>
                  </EmailLoginContainer>
                </Form>
              </LoginContainer>
            )}
          </LoginWrapper>
        </Wrapper>
      </GoogleOAuthProvider>
    </>
  );
};

const Wrapper = styled.div`
  display: flex;
  background-image: url(${BGI});
  width: 100%;
  height: 100%;
  position: relative; // 確保父容器是相對定位
  overflow: hidden;
`;
const Title = styled.h1`
  position: absolute;
  top: 0;
  left: 24px;
  font-size: 64px;
`;

const LoginWrapper = styled.div`
  display: flex;
  right: 0;
  height: 100vh;
  width: 670px;

  overflow: hidden;

  @media (max-width: 768px) {
    margin-top: 47px;
  }
`;

const LoginContainer = styled.div`
  display: flex;
  position: relative;
  padding: 8px;
  width: 100%;
  height: 100vh;
  background-color: #fff;
  border-left: 1px solid gray;
`;

const Form = styled.form`
  display: flex;
  margin: 240px 0 auto 0;
  width: 100%;
  height: 80%;
`;
const UsernameContainer = styled.div<{ isVisible: boolean }>`
  position: absolute;
  top: 150px;
  opacity: ${(props) => (props.isVisible ? 1 : 0)};
  width: 362px;
`;
const Input = styled.input`
  margin-bottom: 10px;
  padding: 8px 0 8px 48px;
  font-size: 16px;
  width: 100%;
  border: 2px solid transparent;
  font-family: "KG Second Chances", sans-serif;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
  &::placeholder {
    font-family: "KG Second Chances", sans-serif;
    font-size: 16px;
    color: #999;
  }
  &:focus {
    border-color: gray;
    background-color: #fff;
    outline: gray;
  }
`;
const InputTitle = styled.div``;

const InputContainer = styled.div`
  position: relative;
  margin: 12px 0;
`;
const InputIcon = styled.img`
  position: absolute;
  top: 8px;
  left: 12px;
`;
const EmailLoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 80%;
  height: 100%;
  margin: 0 auto;
`;

const ButtonContainer = styled.div`
  display: flex;
  width: 100%;
  margin: 24px 0;
`;

const GoogleButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin: 24px 0;
`;
const Split = styled.div`
  position: relative;
  height: 1px;
  width: 100%;
  background-color: #000;
`;
const SplitText = styled.span`
  position: absolute;
  padding: 0 8px;
  top: -12px;
  left: 50%;
  background-color: #fff;
  transform: translateX(-50%);
`;

const SignUpText = styled.p`
  text-align: center;
`;
const SignUpLink = styled.a`
  color: #a23419;
  cursor: pointer;
  text-decoration: underline;
`;
export default Login;
