import {
  doc,
  setDoc,
  serverTimestamp,
  Timestamp,
  collection,
  addDoc,
  getDocs,
  getDoc,
  deleteDoc,
  query,
  where,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { User, Auth } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export const updateUserProfile = async (user: User, userName?: string) => {
  try {
    const userRef = doc(db, "users", user.uid);
    await setDoc(
      userRef,
      {
        uid: user.uid,
        email: user.email,
        username: userName || user.displayName || "Unknown",
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
  nutrition: {
    calories?: string;
    carbohydrates?: string;
    protein?: string;
    fat?: string;
  };
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

export const uploadImageToStorage = async (file: File): Promise<string> => {
  try {
    const storage = getStorage();
    const storageRef = ref(storage, `images/${file.name}`);

    const snapshot = await uploadBytes(storageRef, file);

    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log("圖片已上傳，下載 URL:", downloadURL);

    return downloadURL;
  } catch (error) {
    console.error("圖片上傳失敗:", error);
    throw new Error("圖片上傳失敗");
  }
};
interface HistoryItem {
  tdee: number;
  age: number;
  weight: number;
  height: number;
  gender: string;
  activityLevel: string;
  bodyFat?: number;
  bmi?: number;
  clientUpdateTime: {
    seconds: number;
    nanoseconds: number;
  };
}

export const updateTDEEHistory = async (
  user: User,
  tdee: number,
  age: number,
  weight: number,
  height: number,
  gender: string,
  activityLevel: string,
  bodyFat?: number,
  bmi?: number
) => {
  if (!user) {
    throw new Error("請先登入");
  }

  const userRef = doc(db, "users", user.uid);
  const userDoc = await getDoc(userRef);
  const userData = userDoc.data();
  const today = new Date();
  const todayDateString = today.toISOString().split("T")[0];

  let history: HistoryItem[] = userData?.history || [];

  const existingRecordIndex = history.findIndex((item: HistoryItem) => {
    const itemDate = new Date(item.clientUpdateTime.seconds * 1000)
      .toISOString()
      .split("T")[0];
    return itemDate === todayDateString;
  });

  if (existingRecordIndex !== -1) {
    const updatedHistory = history[existingRecordIndex];
    updatedHistory.tdee = tdee;
    updatedHistory.age = age;
    updatedHistory.weight = weight;
    updatedHistory.height = height;
    updatedHistory.gender = gender;
    updatedHistory.activityLevel = activityLevel;
    updatedHistory.bodyFat = bodyFat;
    updatedHistory.bmi = bmi;
    updatedHistory.clientUpdateTime = Timestamp.fromDate(new Date());

    await updateDoc(userRef, {
      history: arrayRemove(history[existingRecordIndex]),
    });

    await updateDoc(userRef, {
      history: arrayUnion(updatedHistory),
    });

    console.log("當天的 TDEE 記錄已更新");
  } else {
    await updateDoc(userRef, {
      history: arrayUnion({
        tdee,
        age,
        weight,
        height,
        gender,
        activityLevel,
        bodyFat,
        clientUpdateTime: Timestamp.fromDate(new Date()),
      }),
    });

    console.log("TDEE 記錄已新增");
  }

  await updateDoc(userRef, {
    lastUpdated: serverTimestamp(),
  });
};

export const getUserHistory = async (
  user: User,
  returnLatest: boolean = false
) => {
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
    console.log("沒有歷史紀錄");
    return [];
  }

  const sortedHistory = userData.history.sort(
    (a: any, b: any) => b.clientUpdateTime.seconds - a.clientUpdateTime.seconds
  );

  return returnLatest ? sortedHistory[0] : sortedHistory;
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

export const fetchDiaryEntryById = async (user: User, diaryId: string) => {
  if (!user) {
    throw new Error("請先登入");
  }

  const diaryRef = doc(db, "users", user.uid, "diarys", diaryId);
  const diarySnapshot = await getDoc(diaryRef);

  if (!diarySnapshot.exists()) {
    throw new Error(`日記條目 ${diaryId} 不存在`);
  }

  const diaryData = diarySnapshot.data();
  return {
    id: diarySnapshot.id,
    ...diaryData,
  };
};

export const updateDiaryEntry = async (
  user: User,
  diaryId: string,
  updatedData: Partial<DiaryEntry>
) => {
  if (!user) {
    throw new Error("請先登入");
  }

  const diaryRef = doc(db, "users", user.uid, "diarys", diaryId);

  await updateDoc(diaryRef, {
    ...updatedData,
    lastUpdated: serverTimestamp(),
  });

  console.log(`日記條目 ${diaryId} 已成功更新`);
};
