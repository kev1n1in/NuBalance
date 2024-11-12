import styled from "styled-components";
import { DiaryCardProps } from "../../types/Diary";
import Loader from "../Loader";
import trashImg from "./trash.png";

const DiaryCard = ({
  title,
  entries,
  isLoading,
  handleEdit,
  handleDeleteClick,
}: DiaryCardProps) => (
  <MealSectionContainer>
    <Loader isLoading={isLoading} />
    <h2>{title}</h2>

    {entries.length > 0 ? (
      entries.map((entry) => (
        <DiaryItem key={entry.id} onClick={() => handleEdit(entry.id)}>
          <FoodName>{entry.food}</FoodName>
          <div>
            <span>{entry.nutrition?.calories || "未知"} | </span>
            <span>{entry.nutrition?.carbohydrates || "未知"} | </span>
            <span>{entry.nutrition?.protein || "未知"} | </span>
            <span>{entry.nutrition?.fat || "未知"}</span>
          </div>
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

const FoodName = styled.span`
  font-size: 24px;
`;

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
