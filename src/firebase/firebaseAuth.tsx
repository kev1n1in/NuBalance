import {
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth";
import { auth } from "./firebaseConfig";

export const signInWithGoogle = async (idToken: string) => {
  try {
    const credential = GoogleAuthProvider.credential(idToken);
    const result = await signInWithCredential(auth, credential);
    console.log("登入成功:", result.user);
    return result.user;
  } catch (error) {
    console.error("登入失敗", error);
    throw error;
  }
};
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    console.log("登入成功", userCredential);
    return userCredential.user;
  } catch (error: any) {
    console.error("登入失敗:", error.code, error.message);
    if (error.code === "auth/network-request-failed") {
      console.log("網絡請求失敗，可能是 CORS 問題或網絡環境問題。");
    }
    throw error;
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
    console.log("成功登出");
  } catch (error) {
    console.error("登出失敗", error);
    throw error;
  }
};
