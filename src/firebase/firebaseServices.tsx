import {
  doc,
  setDoc,
  serverTimestamp,
  collection,
  addDoc,
  getDocs,
  getDoc,
  deleteDoc,
  query,
  where,
  updateDoc,
  arrayUnion,
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
  imageUrl: string;
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
        `熱量 ${food.calories} 大卡`,
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

interface CreateFoodItem {
  id: string;
  food_name: string;
  food_info: string[];
  uid?: string;
}

export const fetchFoodData = async (
  searchTerm: string,
  currentUserUid: string
): Promise<CreateFoodItem[]> => {
  const foodsCol = collection(db, "foods");

  const q = query(
    foodsCol,
    where("food_name", ">=", searchTerm),
    where("food_name", "<=", searchTerm + "\uf8ff")
  );

  const foodSnapshot = await getDocs(q);
  const foodList = foodSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<CreateFoodItem, "id">),
  }));

  return foodList.sort((a, b) => {
    if (a.uid === currentUserUid && b.uid !== currentUserUid) {
      return -1;
    }
    if (a.uid !== currentUserUid && b.uid === currentUserUid) {
      return 1;
    }
    return 0;
  });
};

interface DiaryEntry {
  meal: string;
  food: string;
  time: Date;
  mood?: string | null;
  note?: string;
  imageUrl?: string;
  nutrition: string[];
}

export const addDiaryEntry = async (user: User, entry: DiaryEntry) => {
  if (!user) {
    throw new Error("請先登入");
  }
  const userDiaryRef = collection(doc(db, "users", user.uid), "diarys");
  const docRef = await addDoc(userDiaryRef, {
    ...entry,
    createdAt: serverTimestamp(),
    nutrition: entry.nutrition,
  });
  console.log("已新增,Id:", docRef.id);
  return docRef.id;
};

export const updateTDEEHistory = async (
  user: User,
  tdee: number,
  age: number,
  weight: number,
  height: number,
  gender: string,
  activityLevel: string,
  bodyFat?: number
) => {
  if (!user) {
    throw new Error("請先登入");
  }
  const userRef = doc(db, "users", user.uid);

  await updateDoc(userRef, {
    history: arrayUnion({
      tdee,
      age,
      weight,
      height,
      gender,
      activityLevel,
      bodyFat,
      clientUpdateTime: new Date(),
    }),
  });
  console.log("TDEE已更新");

  await updateDoc(userRef, {
    lastUpdated: serverTimestamp(),
  });
};

export const getLatestTDEE = async (user: User) => {
  if (!user) {
    throw new Error("請先登入");
  }

  const userRef = doc(db, "users", user.uid);
  const userSnapshot = await getDoc(userRef);

  if (!userSnapshot.exists()) {
    throw new Error("用戶不存在");
  }

  const userData = userSnapshot.data();

  if (!userData || !userData.history || userData.history.length === 0) {
    throw new Error("沒有歷史紀錄");
  }

  const sortedHistory = userData.history.sort(
    (a: any, b: any) => b.clientUpdateTime.seconds - a.clientUpdateTime.seconds
  );

  const latestTDEE = sortedHistory[0];
  return latestTDEE;
};

export const getDiaryEntry = async (user: User, date: string) => {
  if (!user) {
    throw new Error("請先登入");
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error("日期格式不正確");
  }

  const diaryRef = collection(db, "users", user.uid, "diarys");
  const startOfDay = new Date(date);
  const endOfDay = new Date(date);
  endOfDay.setDate(endOfDay.getDate() + 1);

  const q = query(
    diaryRef,
    where("time", ">=", startOfDay),
    where("time", "<", endOfDay)
  );

  const diarySnapshot = await getDocs(q);

  if (diarySnapshot.empty) {
    return [];
  }

  const diaryEntries = diarySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return diaryEntries;
};
export const deleteDiaryEntry = async (user: User, diaryId: string) => {
  if (!user) {
    throw new Error("請先登入");
  }
  try {
    const diaryRef = doc(db, "users", user.uid, "diarys", diaryId);
    await deleteDoc(diaryRef);
    console.log(`日記 ${diaryId}已成功刪除`);
  } catch (error) {
    console.error(`刪除日記條目失敗: ${error}`);
    throw error;
  }
};
