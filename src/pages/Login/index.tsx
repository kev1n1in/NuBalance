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

interface ButtonProps {
  label: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

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
  const Button = ({ label, onClick }: ButtonProps) => {
    return <button onClick={onClick}>{label}</button>;
  };
  return (
    <>
      <GoogleOAuthProvider clientId={clientId}>
        <Wrapper>
          <Banner />
          <LoginContainer>
            <h1>Hello</h1>
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
