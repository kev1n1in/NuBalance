import styled from "styled-components";
import Loader from "../Loader";
import trashImg from "./trash.png";

interface DiaryCardProps {
  title: string;
  entries: DiaryEntry[];
  isLoading: boolean;
  handleEdit: (id: string) => void;
  handleDeleteClick: (id: string, foodName: string) => void;
}

interface DiaryEntry {
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

const DiaryCard = ({
  title,
  entries,
  isLoading,
  handleEdit,
  handleDeleteClick,
}: DiaryCardProps) => (
  <MealSectionContainer>
    <Loader isLoading={isLoading} />
    <DiaryTitle>{title}</DiaryTitle>

    {entries.length > 0 ? (
      entries.map((entry) => (
        <DiaryItem key={entry.id} onClick={() => handleEdit(entry.id)}>
          <FoodName>{entry.food}</FoodName>
          <FoodNutrition>
            <FoodCal>{entry.nutrition?.calories || "未知"} | </FoodCal>
            <FoodCarbo>{entry.nutrition?.carbohydrates || "未知"} | </FoodCarbo>
            <FoodProtein>{entry.nutrition?.protein || "未知"} | </FoodProtein>
            <FoodFat>{entry.nutrition?.fat || "未知"}</FoodFat>
          </FoodNutrition>
          <DeleteButtonContainer>
            <DeleteButton
              src={trashImg}
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClick(entry.id, entry.food || "此項目");
              }}
            />
          </DeleteButtonContainer>
        </DiaryItem>
      ))
    ) : (
      <EmptyList>No entries yet</EmptyList>
    )}
  </MealSectionContainer>
);

const MealSectionContainer = styled.div`
  margin: 12px 0;
  @media (max-width: 1000px) {
    width: 100%;
    margin: 0 auto;
  }
`;
const EmptyList = styled.div`
  color: gray;
`;
const DiaryTitle = styled.h2``;

const DiaryItem = styled.div`
  display: flex;
  position: relative;
  flex-direction: column;
  margin: 12px 0;
  padding: 4px 40px 8px 8px;
  border: 2px solid gray;
  border-radius: 4px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.08);
  cursor: pointer;
`;
const FoodNutrition = styled.div``;

const FoodName = styled.span`
  font-size: 24px;
`;

const FoodCal = styled.span``;

const FoodCarbo = styled.span``;

const FoodProtein = styled.span``;

const FoodFat = styled.span``;

const DeleteButtonContainer = styled.div`
  position: absolute;
  top: 50%;
  right: 8px;
  width: 30px;
  height: 30px;
  z-index: 10;
  transform: translateY(-50%);
`;

const DeleteButton = styled.img`
  width: 30px;
  height: 30px;
  cursor: pointer;
`;
export default DiaryCard;
