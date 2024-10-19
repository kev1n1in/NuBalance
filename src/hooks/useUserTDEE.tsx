import { useQuery } from "react-query";
import { auth } from "../firebase/firebaseConfig";
import { getUserHistory } from "../firebase/firebaseServices";
import useAlert from "./useAlertMessage";

export function useUserTDEE() {
  const { addAlert } = useAlert();

  return useQuery(
    "latestTDEE",
    async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        addAlert("User not logged in");
        throw new Error("User not logged in");
      }
      const latestHistory = await getUserHistory(currentUser, true);
      if (!latestHistory) {
        addAlert("No User TDEE record found.");
      }
      return {
        tdee: latestHistory?.tdee || 2141,
        bmi: latestHistory?.bmi || 0,
        bodyFat: latestHistory?.bodyFat || 0,
      };
    },
    {
      onError: () => {
        addAlert("get TDEE record fail.");
      },
    }
  );
}
