import { Auth, User } from "firebase/auth";
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { db } from "../firebase/firebaseConfig";

let isUserProfileUpdated = false;

export const updateUserProfile = async (user: User, userName?: string) => {
  try {
    if (isUserProfileUpdated) {
      return;
    }
    if (!user || !user.uid) {
      throw new Error("User can not defined.");
    }

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

    isUserProfileUpdated = true;
  } catch (error) {
    throw error;
  }
};
export const fetchUserName = async (user: User): Promise<string> => {
  if (!user) {
    throw new Error("尚未登入");
  }
  const userRef = doc(db, "users", user.uid);
  const userSnapshot = await getDoc(userRef);
  if (userSnapshot.exists()) {
    const userData = userSnapshot.data();
    return userData.username || "未知用户名";
  } else {
    throw new Error("資料發生錯誤");
  }
};
interface FoodItem {
  food_name: string;
  food_info: string[];
  calories: number;
  carbohydrates: number;
  protein: number;
  fat: number;
  imageUrl: string | null;
}

export const addFoodItem = async (
  food: FoodItem,
  auth: Auth
): Promise<string> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("用戶未登錄");
    }

    const uid = user.uid;
    const foodsCol = collection(db, "foods");
    const docRef = await addDoc(foodsCol, {
      food_name: food.food_name,
      food_info: [
        `Calories ${food.calories} Cal`,
        `Carbohydrate ${food.carbohydrates} g`,
        `Protein ${food.protein} g`,
        `Fat ${food.fat} g`,
      ],
      uid: uid,
      createdAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
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
  id?: string;
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
  return docRef.id;
};

export const uploadImageToStorage = async (file: File): Promise<string> => {
  try {
    const storage = getStorage();
    const storageRef = ref(storage, `images/${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
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
  bmi?: number,
  clientUpdateTime?: Timestamp
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
    const updatedHistory = {
      ...history[existingRecordIndex],
      tdee,
      age,
      weight,
      height,
      gender,
      activityLevel,
      bodyFat,
      bmi,
      clientUpdateTime: clientUpdateTime || Timestamp.fromDate(new Date()),
    };
    await updateDoc(userRef, {
      history: arrayRemove(history[existingRecordIndex]),
    });
    await updateDoc(userRef, {
      history: arrayUnion(updatedHistory),
    });
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
        bmi,
        clientUpdateTime: Timestamp.fromDate(new Date()),
      }),
    });
  }

  await updateDoc(userRef, {
    lastUpdated: serverTimestamp(),
  });
};

export const getUserHistory = async (
  user: User,
  returnLatest: boolean = false,
  targetDate?: Date
) => {
  if (!user) {
    throw new Error("請先登入");
  }

  const userRef = doc(db, "users", user.uid);
  const userSnapshot = await getDoc(userRef);

  const userData = userSnapshot.data();

  if (!userData || !userData.history || userData.history.length === 0) {
    return [];
  }

  let filteredHistory = userData.history;

  const sortedHistory = filteredHistory.sort(
    (a: any, b: any) => b.clientUpdateTime.seconds - a.clientUpdateTime.seconds
  );
  if (returnLatest) {
    const latestEntry = sortedHistory.length > 0 ? sortedHistory[0] : null;
    return latestEntry;
  }

  if (targetDate) {
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const targetTimestamp = nextDay.getTime() / 1000;

    filteredHistory = sortedHistory
      .filter((item: any) => {
        const updateTime = item.clientUpdateTime.seconds;
        return updateTime <= targetTimestamp;
      })
      .slice(0, 7);
  }

  return filteredHistory.length > 0 ? filteredHistory : [];
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
  } catch (error) {
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
};
