import {
  signInWithCredential,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth";
import { auth } from "./firebaseConfig";
import { updateUserProfile } from "./firebaseServices";

export const signInWithGoogle = async (idToken: string) => {
  try {
    const credential = GoogleAuthProvider.credential(idToken);
    const result = await signInWithCredential(auth, credential);
    console.log("登入成功:", result.user);
    await updateUserProfile(result.user);

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
    await updateUserProfile(userCredential.user);
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
export const signUpWithEmail = async (
  email: string,
  password: string,
  username: string
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    console.log("註冊成功:", user);

    await updateUserProfile(user, username);

    return user;
  } catch (error: any) {
    console.error("註冊失敗:", error.code, error.message);
    if (error.code === "auth/email-already-in-use") {
      console.log("該電子郵件地址已被註冊。");
    } else if (error.code === "auth/invalid-email") {
      console.log("電子郵件格式無效。");
    } else if (error.code === "auth/weak-password") {
      console.log("密碼強度不足。");
    }
    throw error;
  }
};
