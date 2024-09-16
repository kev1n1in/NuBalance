import { create } from "zustand";

type StoreState = {
  tdee: number | null;
  setTdee: (value: number) => void;
};

const useStore = create<StoreState>((set) => ({
  tdee: null,
  setTdee: (value: number) => set({ tdee: value }),
}));

export default useStore;
