import { useState, useEffect, MouseEvent } from "react";
import {
  signInWithGoogle,
  signInWithEmail,
  signOutUser,
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
import WomenImg from "./womenSit.png";
import BGI from "../../asset/draft.png";
import emailIcon from "./email.png";
import passwordIcon from "./password.png";
import userIcon from "./user.png";

const Login = () => {
  const [user, setUser] = useState<User | null>(null);
  const [inputUser, setInputUser] = useState("");
  const [inputEmail, setInputEmail] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

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
    console.log("Login Attempt with credentials:", {
      email: inputEmail,
      password: inputPassword,
    });

    try {
      const user: User = await signInWithEmail(inputEmail, inputPassword);
      console.log("Login Success:", user);

      if (user) {
        await updateUserProfile(user, inputEmail);

        Cookies.set("username", user.email || "User", { expires: 7 });
        Cookies.set("isLoggedIn", "true", { expires: 7 });
        setIsLoggedIn(true);

        navigate("/userInfo");
      } else {
        alert("User is not logged in. Please log in first.");
      }
    } catch (error: any) {
      console.error("Login failed:", error);
    }
  };

  const handleGoogleLogin = async (response: CredentialResponse) => {
    if (response?.credential) {
      try {
        const googleUser = await signInWithGoogle(response.credential);
        Cookies.set("username", googleUser.displayName || "Google User", {
          expires: 7,
        });
        Cookies.set("isLoggedIn", "true", { expires: 7 });
        setIsLoggedIn(true);

        navigate("/userInfo");
      } catch (error) {
        console.error("Firebase login failed:", error);
      }
    } else {
      console.log("Login Failed:", response);
    }
  };

  const removeUserCookie = async () => {
    try {
      await signOutUser();
      Cookies.remove("isLoggedIn");
      Cookies.remove("username");
      setIsLoggedIn(false);
      console.log("成功登出");
      setUser(null);
    } catch (error) {
      console.error("登出失敗", error);
    }
  };
  const handleSignUp = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log("Sign Up Attempt with credentials:", {
      userName: inputUser,
      email: inputEmail,
      password: inputPassword,
    });

    try {
      // 使用 signUpWithEmail 註冊新用戶
      const newUser = await signUpWithEmail(
        inputEmail,
        inputPassword,
        inputUser
      );
      console.log("Sign Up Success:", newUser);

      // 彈出註冊成功提示
      alert("註冊成功！請使用您的帳號登入。");

      // 切換回登入狀態
      setIsSignUp(false);
    } catch (error) {
      console.error("Sign Up failed:", error);
      alert("註冊失敗，請確認輸入資料並再試一次。");
    }
  };

  return (
    <>
      <GoogleOAuthProvider clientId={clientId}>
        <Wrapper>
          <Container>
            <Img src={WomenImg} />
            {/* <HandWrittenTextWrapper>
              <HandWrittenTextContainer>
                <HandWrittenText
                  text="Welcome"
                  roughness={0}
                  color="black"
                  fill="yellow"
                  fontSize={150}
                />
              </HandWrittenTextContainer>
            </HandWrittenTextWrapper> */}

            <LoginContainer>
              {isLoggedIn ? (
                <div>
                  <p>Welcome, {user?.email || "User"}</p>
                  <ButtonContainer>
                    <Button
                      color="white"
                      backgroundColor="black"
                      label="Log out"
                      onClick={removeUserCookie}
                    />
                  </ButtonContainer>
                </div>
              ) : (
                <Form>
                  <EmailLoginContainer>
                    <Title>{isSignUp ? "SignUp" : "LogIn"}</Title>
                    <UsernameContainer isVisible={isSignUp}>
                      <InputTitle>UserName</InputTitle>
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
                    <InputTitle>Email</InputTitle>
                    <InputContainer>
                      <InputIcon src={emailIcon}></InputIcon>
                      <Input
                        type="email"
                        value={inputEmail}
                        onChange={(e) => setInputEmail(e.target.value)}
                        placeholder="admin@1.com"
                      />
                    </InputContainer>
                    <InputTitle>Password</InputTitle>
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
                      <GoogleLoginButton
                        onSuccess={handleGoogleLogin}
                        onError={() => console.error("Login Failed")}
                      />
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
              )}
            </LoginContainer>
          </Container>
        </Wrapper>
      </GoogleOAuthProvider>
    </>
  );
};

const Wrapper = styled.div`
  display: flex;
  background-image: url(${BGI});
  justify-content: end;
  align-items: center;
  width: 100%;
  height: 100vh;
`;
const Title = styled.h1`
  position: absolute;
  top: 0;
  left: 24px;
  font-size: 64px;
`;

const Container = styled.div`
  display: flex;
  height: 100vh;
  width: 650px;
  overflow: hidden;

  @media (max-width: 768px) {
    margin-top: 47px;
  }
`;
const HandWrittenTextWrapper = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
`;
const HandWrittenTextContainer = styled.div`
  margin-bottom: 48px;
  width: 40%;
`;
const Img = styled.img`
  position: absolute;
  left: 64px;
  top: 0px;
  height: 40%;
  /* @media (max-width: 768px) {
    top: 100px;
    height: 300px;
  } */
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
  width: 380px;
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
  width: 60%;
  height: 100%;
  margin: 0 auto;
`;
const GoogleLoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 30%;
  height: 100%;
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
