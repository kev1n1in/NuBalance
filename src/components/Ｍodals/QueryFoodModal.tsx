import { useState } from "react";
import styled from "styled-components";
import Button from "../Button";
import { useQuery } from "react-query";
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
  const [errorMessage, setErrorMessage] = useState<string>("");

  const currentUser = auth.currentUser;
  const handleFoodCreated = (foodName: string) => {
    setSearchTerm(foodName);
    setIsModalOpen(false);
    setTriggerSearch(true);
    refetch();
  };

  const {
    data: foods = [],
    isLoading,
    error,
    refetch,
  } = useQuery(
    ["foods", triggerSearch],
    () => fetchFoodData(searchTerm, currentUser?.uid || ""),
    { enabled: searchTerm.trim().length > 0 }
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage("");
    setSearchTerm(event.target.value);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      if (searchTerm.trim() === "") {
        setErrorMessage("請輸入關鍵字");
      } else {
        setErrorMessage("");
        setTriggerSearch(true);
        refetch();
      }
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
      <Title>What did you eat?</Title>
      <InputContainer>
        <Input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Please Enter Food Keyword"
        />
        <SearchImg />
        {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
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
          <p>There is no result</p>
        )}

        <NoItemsMessage>
          Can't find it? Try
          <CreateLink onClick={openModal}> adding </CreateLink>
          it.
        </NoItemsMessage>
      </FoodDataContainer>

      <SelectedFoodContainer>
        {selectedItem ? (
          <SelectResult>
            <FoodName>{selectedItem.food_name}</FoodName>
            <FoodInfo>{selectedItem.food_info.join("｜")}</FoodInfo>
          </SelectResult>
        ) : (
          <SelectResult>Search Result</SelectResult>
        )}
      </SelectedFoodContainer>

      <ButtonContainer>
        <Button
          strokeColor="gary"
          label="Save"
          onClick={handleAddClick}
        ></Button>
      </ButtonContainer>

      {isModalOpen && (
        <Modal onClose={closeModal}>
          <CreateFoodModal
            onClose={closeModal}
            onFoodCreated={handleFoodCreated}
          />
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

const Input = styled.input`
  font-family: "KG Second Chances", sans-serif;
  padding: 8px;
  font-size: 16px;
`;

const ErrorMessage = styled.p`
  color: red;
  font-size: 14px;
`;

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
