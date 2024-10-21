import { useQuery } from "react-query";
import { auth } from "../../firebase/firebaseConfig";
import { getDiaryEntry } from "../../firebase/firebaseServices";
import { DiaryEntry } from "../../types/Hooks";

export const useDiaryEntries = (selectedDate: Date) => {
  return useQuery<DiaryEntry[]>(
    ["diaryEntries", selectedDate.toLocaleDateString("sv-SE")],
    async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("User not logged in");
      }
      const formattedDate = selectedDate.toLocaleDateString("sv-SE");
      return (await getDiaryEntry(currentUser, formattedDate)) || [];
    }
  );
};
