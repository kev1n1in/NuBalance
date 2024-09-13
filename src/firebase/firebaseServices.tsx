import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { User } from "firebase/auth";

export const updateUserProfile = async (user: User) => {
  try {
    const userRef = doc(db, "users", user.uid);
    await setDoc(
      userRef,
      {
        uid: user.uid,
        email: user.email,
        username: user.displayName || "Unknown",
        createdAt: user.metadata.creationTime,
        lastLoged: serverTimestamp(),
      },
      { merge: true }
    );

    console.log("用戶資料已更新到 Firestore");
  } catch (error) {
    console.error("更新用戶資料失敗:", error);
    throw error;
  }
};
