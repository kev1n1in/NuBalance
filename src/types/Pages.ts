export interface CalculatorPageProps {
  age: number;
  gender: string;
  weight: number;
  height: number;
  activityLevel: string;
  bodyFat: number;
  totalCalories: number;
  [key: string]: string | number;
}

export interface FoodItem {
  id: string;
  food_name: string;
  food_info: string[];
}

export type ReportHistoryItem = {
  clientUpdateTime: { seconds: number };
  weight: number;
  date: string;
  bodyFat: number;
};
export type ReportNutritionData = {
  fat: string;
  carbohydrates: string;
  protein: string;
};

export type ReportDiaryEntry = {
  id: string;
  nutrition?: ReportNutritionData;
};

export interface RemainCaloriesProps {
  isExceeded: boolean;
}
