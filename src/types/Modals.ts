export interface FormValues {
  foodInfo: string[];
  foodName: string;
  calories: number;
  carbohydrates: number;
  protein: number;
  fat: number;
  image: FileList;
}

export interface CreateFoodModalProps {
  onClose: () => void;
  onFoodCreated: (foodName: string) => void;
}

export interface FoodItem {
  id: string;
  food_name: string;
  food_info: string[];
}
export interface DiaryFoodModalProps {
  onClose: () => void;
  entryId: string;
  selectedDate: Date;
}
export interface DiaryEntry {
  id: string;
  meal?: string;
  food?: string;
  time?: string;
  mood?: string;
  note?: string;
  imageUrl?: string;
  nutrition?: {
    calories?: string;
    carbohydrates?: string;
    protein?: string;
    fat?: string;
  };
}
export type MealItem = {
  id: string;
  name: string;
  imgSrc: string;
  selectImgSrc: string;
};

export type MoodItem = {
  id: string;
  name: string;
  imgSrc: string;
};

export interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export type QueryFoodModalProps = {
  onAddFood: (food: FoodItem) => void;
};
