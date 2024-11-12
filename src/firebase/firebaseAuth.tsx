import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
  UserCredential,
} from "firebase/auth";
import { auth } from "./firebaseConfig";
import { updateUserProfile } from "./firebaseServices";

export const signInWithGoogle = async (
  accessToken: string
): Promise<UserCredential> => {
  try {
    const credential = GoogleAuthProvider.credential(null, accessToken);
    const userCredential = await signInWithCredential(auth, credential);
    return userCredential;
  } catch (error) {
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
    await updateUserProfile(userCredential.user);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const signOutUser = () => signOut(auth);

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
    await updateUserProfile(user, username);

    return user;
  } catch (error) {
    throw error;
  }
};
