export interface FoodItem {
  food_name: string;
  food_info: string[];
  calories: number;
  carbohydrates: number;
  protein: number;
  fat: number;
  imageUrl: string | null;
}
export interface CreateFoodItem {
  id: string;
  food_name: string;
  food_info: string[];
  uid?: string;
}

export interface DiaryEntry {
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

export interface HistoryItem {
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
