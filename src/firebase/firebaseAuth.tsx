import {
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
  signOut,
} from "firebase/auth";
import { app } from "./firebaseConfig";

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

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

export const signOutUser = async () => {
  try {
    await signOut(auth);
    console.log("成功登出");
  } catch (error) {
    console.error("登出失敗", error);
    throw error;
  }
};
