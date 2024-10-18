import { useQuery } from "react-query";
import { fetchUserName } from "../firebase/firebaseServices";
import { auth } from "../firebase/firebaseConfig";

export const useUserName = () => {
  return useQuery(
    "fetchUserName",
    async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("User not logged in");
      }
      return fetchUserName(currentUser);
    },
    {
      enabled: !!auth.currentUser,
    }
  );
};
