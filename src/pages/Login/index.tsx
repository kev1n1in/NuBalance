import { useState, useEffect } from "react";
import {
  GoogleOAuthProvider,
  GoogleLogin,
  CredentialResponse,
} from "@react-oauth/google";
import {
  signInWithGoogle,
  signOutUser,
  auth,
} from "../../firebase/firebaseAuth";
import { onAuthStateChanged, User } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { updateUserProfile } from "../../firebase/firebaseServices";

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const Login = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        console.log("Logged in as:", currentUser);
      } else {
        setUser(null);
        console.log("User logged out");
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (response: CredentialResponse) => {
    if (response?.credential) {
      try {
        const googleUser = await signInWithGoogle(response.credential);
        updateUserProfile(googleUser);
        console.log("Login Success:", googleUser);
        navigate("/userInfo");
      } catch (error) {
        console.error("Firebase login failed:", error);
      }
    } else {
      console.log("Login Failed:", response);
    }
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <h1>我是登入</h1>
      {user ? (
        <div>
          <p>Welcome, {user.displayName}</p>
          <button onClick={signOutUser}>登出</button>
        </div>
      ) : (
        <GoogleLogin
          onSuccess={handleLogin}
          onError={() => console.error("Login Failed")}
        />
      )}
    </GoogleOAuthProvider>
  );
};

export default Login;
