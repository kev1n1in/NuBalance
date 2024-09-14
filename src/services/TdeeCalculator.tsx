const calculateTDEE = (
  weight: number,
  height: number,
  age: number,
  gender: string,
  activityLevel: string
) => {
  const BMR =
    gender === "male"
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;

  const activityMultiplier: { [key: string]: number } = {
    Sedentary: 1.2,
    Light: 1.375,
    Moderate: 1.55,
    Active: 1.725,
    VeryActive: 1.9,
  };

  return Math.round(BMR * activityMultiplier[activityLevel]);
};
export default calculateTDEE;
