export interface FormItemProps {
  title: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  required?: boolean;
}
export interface SliderProps {
  value: number;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  min: number;
  max: number;
}
