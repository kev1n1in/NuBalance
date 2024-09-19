import styled from "styled-components";
import Button from "../Button";
import { useQuery } from "react-query";
import { useState } from "react";
import { fetchFoodData } from "../../firebase/firebaseServices";
import { auth } from "../../firebase/firebaseConfig";
import CreateFoodModal from "./CreateFoodModal";
import Modal from "../Modal";

type FoodItem = {
  id: string;
  food_name: string;
  food_info: string[];
};
type QueryFoodModalProps = {
  onAddFood: (food: FoodItem) => void;
};

const QueryFoodModal: React.FC<QueryFoodModalProps> = ({ onAddFood }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [triggerSearch, setTriggerSearch] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);
  const currentUser = auth.currentUser;
  const {
    data: foods = [],
    isLoading,
    error,
    refetch,
  } = useQuery(
    ["foods", triggerSearch],
    () => fetchFoodData(searchTerm, currentUser?.uid || ""),
    { enabled: searchTerm.length > 0 }
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      setTriggerSearch(true);
      refetch();
    }
  };
  const handleItemClick = (item: FoodItem) => {
    setSelectedItem(item);
  };
  const handleAddClick = () => {
    if (selectedItem) {
      onAddFood(selectedItem);
    }
  };
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <Wrapper>
      <Title>吃了啥？</Title>
      <InputContainer>
        <Input
          type="text"
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        ></Input>
        <SearchImg />
      </InputContainer>
      <FoodDataContainer>
        {isLoading && <p>加載中...</p>}
        {error && error instanceof Error ? (
          <p>發生錯誤: {error.message}</p>
        ) : null}

        {foods.length > 0 ? (
          foods.map((item) => (
            <ResultItem
              key={item.id}
              onClick={() => handleItemClick(item)}
              isSelected={selectedItem?.id === item.id}
            >
              <FoodName>{item.food_name}</FoodName>
              <FoodInfo>{item.food_info.join("｜")}</FoodInfo>
            </ResultItem>
          ))
        ) : (
          <p>目前沒有相關結果</p>
        )}

        <NoItemsMessage>
          找不到嗎？試試<CreateLink onClick={openModal}>新增</CreateLink>
        </NoItemsMessage>
      </FoodDataContainer>
      <SelectedFoodContainer>
        {selectedItem ? (
          <SelectResult>
            <FoodName>{selectedItem.food_name}</FoodName>
            <FoodInfo>{selectedItem.food_info.join("｜")}</FoodInfo>
          </SelectResult>
        ) : (
          <SelectResult>尚未選擇任何食物</SelectResult>
        )}
      </SelectedFoodContainer>
      <ButtonContainer>
        <Button label="加入" onClick={handleAddClick}></Button>
      </ButtonContainer>
      {isModalOpen && (
        <Modal onClose={closeModal}>
          <CreateFoodModal onClose={closeModal} />
        </Modal>
      )}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 80vh;
`;
const Title = styled.h1`
  text-align: center;
`;
const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const Input = styled.input``;

const SearchImg = styled.img``;

const FoodDataContainer = styled.div`
  margin: 24px 0;
  height: 40vh;
  overflow: auto;
  border: 1px solid black;
  &::-webkit-scrollbar {
    display: none;
  }

  -ms-overflow-style: none;
  scrollbar-width: none;
`;

const SelectedFoodContainer = styled.div``;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: end;
`;

const ResultItem = styled.div<{ isSelected: boolean }>`
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: ${({ isSelected }) => (isSelected ? "#f0f0f0" : "white")};
  cursor: pointer;

  &:hover {
    background-color: #f9f9f9;
  }
`;

const FoodName = styled.h3`
  margin: 0;
  font-size: 18px;
`;

const FoodInfo = styled.p`
  margin: 5px 0 0;
  color: #555;
`;

const SelectResult = styled.div`
  height: 100px;
  margin: 20px 0;
  padding: 8px;
  border: 1px solid black;
`;
const NoItemsMessage = styled.p`
  padding: 8px;
`;
const CreateLink = styled.span`
  color: #007bff;
  cursor: pointer;
`;
export default QueryFoodModal;
