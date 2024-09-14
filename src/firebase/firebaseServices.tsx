import {
  doc,
  setDoc,
  serverTimestamp,
  collection,
  addDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { User, Auth } from "firebase/auth";

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

interface FoodItem {
  food_name: string;
  food_info: string[];
  calories: number;
  carbohydrates: number;
  protein: number;
  fat: number;
}

export const addFoodItem = async (
  food: FoodItem,
  auth: Auth
): Promise<string> => {
  try {
    const user = auth.currentUser;
    console.log(user);
    if (!user) {
      throw new Error("用戶未登錄");
    }

    const uid = user.uid;

    const foodsCol = collection(db, "foods");
    const docRef = await addDoc(foodsCol, {
      food_name: food.food_name,
      food_info: [
        `碳水化合物 ${food.carbohydrates} 公克`,
        `蛋白質 ${food.protein} 公克`,
        `脂肪 ${food.fat} 公克`,
      ],
      uid: uid,
      createdAt: serverTimestamp(),
    });

    console.log("食品資料已新增到 Firestore，文件 ID:", docRef.id);

    return docRef.id;
  } catch (error) {
    console.error("新增食品資料失敗:", error);
    throw error;
  }
};
