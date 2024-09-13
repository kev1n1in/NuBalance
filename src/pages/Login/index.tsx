import { useState, useEffect } from "react";
import { signInWithGoogle, signOutUser } from "../../firebase/firebaseAuth";
import { onAuthStateChanged, User } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { updateUserProfile } from "../../firebase/firebaseServices";
import Cookies from "js-cookie";
import { auth } from "../../firebase/firebaseConfig";
import Header from "../../components/Header";
import GoogleLoginButton from "../../components/GoogleLoginButton";
import styled from "styled-components";
import { CredentialResponse, GoogleOAuthProvider } from "@react-oauth/google";
import Button from "../../components/Button";

const Login = () => {
  const [user, setUser] = useState<User | null>(null);
  const [inputUsername, setInputUsername] = useState("");
  const [inputEmail, setInputEmail] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const Username = "admin";
  const Email = "admin@1.com";
  const Password = "123456";

  useEffect(() => {
    const loggedIn = Cookies.get("isLoggedIn");
    const savedUsername = Cookies.get("username");

    if (loggedIn === "true" && savedUsername) {
      setIsLoggedIn(true);
      setInputUsername(savedUsername);
      console.log(`Restored session for user: ${savedUsername}`);
    } else {
      setIsLoggedIn(false);
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        Cookies.set("isLoggedIn", "true", { expires: 7 });
        console.log("Logged in as:", currentUser.displayName);
      } else {
        setUser(null);
        Cookies.remove("isLoggedIn");
        console.log("User logged out");
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = () => {
    if (
      inputUsername === Username &&
      inputEmail === Email &&
      inputPassword === Password
    ) {
      console.log("Login Success with hardcoded credentials");

      Cookies.set("username", inputUsername, { expires: 7 });
      Cookies.set("isLoggedIn", "true", { expires: 7 });
      setIsLoggedIn(true);

      navigate("/userInfo");
    } else {
      console.log("Login Failed: Invalid credentials");
      alert("Invalid username, email or password");
    }
  };

  const handleGoogleLogin = async (response: CredentialResponse) => {
    if (response?.credential) {
      try {
        const googleUser = await signInWithGoogle(response.credential);
        updateUserProfile(googleUser);

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

  const handleLogout = async () => {
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
      <Header />
      <GoogleOAuthProvider clientId={clientId}>
        <Wrapper>
          <Banner />

          <LoginContainer>
            <h1>Hello</h1>
            {isLoggedIn ? (
              <div>
                <p>Welcome, {inputUsername}</p>
                <ButtonContainer>
                  <Button label="Log out" onClick={handleLogout} />
                </ButtonContainer>
              </div>
            ) : (
              <Form>
                <InputTitle>UserName</InputTitle>
                <Input
                  value={inputUsername}
                  onChange={(e) => setInputUsername(e.target.value)}
                  placeholder="Enter username"
                />
                <InputTitle>Email</InputTitle>
                <Input
                  type="email"
                  value={inputEmail}
                  onChange={(e) => setInputEmail(e.target.value)}
                  placeholder="Enter email"
                />
                <InputTitle>Password</InputTitle>
                <Input
                  type="password"
                  value={inputPassword}
                  onChange={(e) => setInputPassword(e.target.value)}
                  placeholder="Enter password"
                />
                <ButtonContainer>
                  <Button label="Log in" onClick={handleLogin} />
                </ButtonContainer>
                <GoogleLoginButton
                  onSuccess={handleGoogleLogin}
                  onError={() => console.error("Login Failed")}
                />
              </Form>
            )}
          </LoginContainer>
        </Wrapper>
      </GoogleOAuthProvider>
    </>
  );
};

// 樣式定義
const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
`;
const Banner = styled.div`
  width: 100%;
  height: 300px;
  background-color: gray;
`;
const Form = styled.form`
  display: flex;
  flex-direction: column;
`;
const InputTitle = styled.span``;
const Input = styled.input`
  margin-bottom: 10px;
  padding: 8px;
  font-size: 16px;
`;
const LoginContainer = styled.div`
  width: 1000px;
  margin: 0 24px;
`;
const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
`;

export default Login;
