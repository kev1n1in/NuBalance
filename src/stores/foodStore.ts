import { create } from "zustand";

type FoodItem = {
  id: string;
  food_name: string;
  food_info: string[];
};

interface FoodStore {
  selectedFood: FoodItem | null;
  setSelectedFood: (food: FoodItem) => void;
  clearSelectedFood: () => void;
}

export const useFoodStore = create<FoodStore>((set) => ({
  selectedFood: null,
  setSelectedFood: (food) => set({ selectedFood: food }),
  clearSelectedFood: () => set({ selectedFood: null }),
}));
