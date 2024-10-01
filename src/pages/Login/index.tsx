import { useState, useEffect, MouseEvent } from "react";
import {
  signInWithGoogle,
  signInWithEmail,
  signOutUser,
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
import HandWrittenText from "../../components/HandWrittenText";
import BGI from "../../asset/draft.png";

const Login = () => {
  const [user, setUser] = useState<User | null>(null);
  const [inputEmail, setInputEmail] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
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
        console.error("auth.currentUser is null. User is not logged in.");
        alert("User is not logged in. Please log in first.");
      }
    } catch (error: any) {
      console.error("Login failed:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);

      if (error.code === "auth/user-not-found") {
        alert("User not found. Please check your email and try again.");
      } else if (error.code === "auth/wrong-password") {
        alert("Incorrect password. Please try again.");
      } else if (error.code === "auth/invalid-email") {
        alert("Invalid email format.");
      } else {
        alert(`Login failed: ${error.message}`);
      }
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

        console.log("Login Success:", googleUser);
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

  return (
    <>
      <GoogleOAuthProvider clientId={clientId}>
        <Wrapper>
          <Banner>
            <Img src={WomenImg} />
          </Banner>
          <Container>
            <TitleContainer>
              {" "}
              <HandWrittenText
                text="Welcome"
                roughness={0}
                color="black"
                fill="yellow"
                fontSize={150}
              />
            </TitleContainer>

            <LoginContainer>
              {isLoggedIn ? (
                <div>
                  <p>Welcome, {user?.email || "User"}</p>
                  <ButtonContainer>
                    <Button label="Log out" onClick={removeUserCookie} />
                  </ButtonContainer>
                </div>
              ) : (
                <Form>
                  <InputTitle>Email</InputTitle>
                  <Input
                    type="email"
                    value={inputEmail}
                    onChange={(e) => setInputEmail(e.target.value)}
                    placeholder="admin@1.com"
                  />
                  <InputTitle>Password</InputTitle>
                  <Input
                    type="password"
                    value={inputPassword}
                    onChange={(e) => setInputPassword(e.target.value)}
                    placeholder="123456"
                  />
                  <ButtonContainer>
                    <Button label="Log in" onClick={handleLogin} />
                  </ButtonContainer>
                  <GoogleButtonContainer>
                    <GoogleLoginButton
                      onSuccess={handleGoogleLogin}
                      onError={() => console.error("Login Failed")}
                    />
                  </GoogleButtonContainer>
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
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

const Banner = styled.div`
  position: relative;
  background-image: url(${BGI});
  width: 100%;
  height: 300px;
  margin-bottom: 24px;
  background-color: gray;
`;

const Container = styled.div`
  width: 80%;
  @media (max-width: 768px) {
    margin-top: 47px;
  }
`;
const TitleContainer = styled.div`
  margin-bottom: 48px;
`;
const Img = styled.img`
  position: absolute;
  right: 0;
  top: 30px;
  height: 400px;
  /* @media (max-width: 768px) {
    top: 100px;
    height: 300px;
  } */
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const InputTitle = styled.span`
  font-family: "Caveat";
  font-size: 48px;
`;

const Input = styled.input`
  margin-bottom: 10px;
  padding: 8px;
  font-size: 16px;
`;

const LoginContainer = styled.div`
  position: relative;
  top: -48px;
  width: 100%;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: right;
  margin: 24px 0;
`;

const GoogleButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin: 24px 0;
`;

export default Login;
