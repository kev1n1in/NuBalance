export interface DiaryEntry {
  id: string;
  food?: string;
  meal?: string;
  bmi?: string;
  bodyFat?: string;
  nutrition?: {
    calories?: string;
    carbohydrates?: string;
    protein?: string;
    fat?: string;
  };
}
