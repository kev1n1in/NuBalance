type DiaryEntry = {
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
};

export interface DiaryCardProps {
  title: string;
  entries: DiaryEntry[] | [];
  isLoading: boolean;
  handleEdit: (id: string) => void;
  handleDeleteClick: (id: string, foodName: string) => void;
}

export interface HandDrawnProgressProps {
  percentage: number;
  height?: number;
  strokeColor?: string;
  fillColor?: string;
}



