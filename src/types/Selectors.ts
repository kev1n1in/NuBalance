export interface DatePickerProps {
  initialTime: string;
  onDateChange: (date: Date) => void;
}

type MealItem = {
  id: string;
  name: string;
  imgSrc: string;
  selectImgSrc: string;
};

export interface MealSelectorProps {
  meals: MealItem[];
  selectedMeal: MealItem | null;
  handleMealClick: (meal: MealItem) => void;
}

export type MoodItem = {
  id: string;
  name: string;
  imgSrc: string;
};

export interface MoodSelectorProps {
  moods: MoodItem[];
  selectedMood: MoodItem | null;
  setSelectedMoodClick: (mood: MoodItem | null) => void;
}
