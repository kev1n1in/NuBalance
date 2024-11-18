import React, { useState } from "react";
import { useQuery, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import BGI from "../../asset/draft.png";
import Button from "../../components/Button";
import HamburgerIcon from "../../components/MenuButton";
import Overlay from "../../components/Overlay";
import Sidebar from "../../components/Sidebar";
import CreateFoodModal from "../../components/Ｍodals/CreateFoodModal";
import Modal from "../../components/Ｍodals/Modal";
import { auth } from "../../firebase/firebaseConfig";
import { fetchFoodData } from "../../firebase/firebaseServices";
import { useFoodStore } from "../../stores/foodStore";
import { FoodItem } from "../../types/Pages";

const Food = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [triggerSearch, setTriggerSearch] = useState<boolean>(false);
  const [isComposing, setIsComposing] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [toggleMenu, setToggleMenu] = useState<boolean>(false);

  const queryClient = useQueryClient();
  const currentUser = auth.currentUser;
  const navigate = useNavigate();
  const { setSelectedFood } = useFoodStore();

  const {
    data: foods = [],
    isLoading,
    error,
    refetch,
  } = useQuery(
    ["foods", searchTerm],
    () => fetchFoodData(searchTerm, currentUser?.uid || ""),
    {
      enabled: triggerSearch,
      onSuccess: () => setTriggerSearch(false),
    }
  );

  const handleFoodCreated = (foodName: string) => {
    setSearchTerm(foodName);
    setIsModalOpen(false);
    setTriggerSearch(true);
    refetch();
  };
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage("");
    setSearchTerm(e.target.value);
  };

  const handleComposition = (e: React.CompositionEvent<HTMLInputElement>) => {
    if (e.type === "compositionstart") {
      setIsComposing(true);
    } else if (e.type === "compositionend") {
      setIsComposing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isComposing) {
      if (searchTerm.trim() === "") {
        setErrorMessage("請輸入有效的關鍵字");
      } else {
        setErrorMessage("");
        queryClient.invalidateQueries(["foods"]);
        setTriggerSearch(true);
      }
    }
  };

  const handleAddFood = (item: FoodItem) => {
    setSelectedFood(item);
    navigate("../diary");
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const handleMenuToggle = () => {
    setToggleMenu((prev) => !prev);
  };
  return (
    <Wrapper>
      {toggleMenu && <Overlay onClick={handleMenuToggle} />}
      <HamburgerIcon onClick={handleMenuToggle} />
      <Sidebar toggleMenu={toggleMenu} />
      <Container>
        <Title>Food Data Base </Title>
        <Input
          type="text"
          placeholder="Search for food..."
          value={searchTerm}
          onChange={handleSearch}
          onKeyDown={handleKeyDown}
          onCompositionStart={handleComposition}
          onCompositionEnd={handleComposition}
        />
        {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}

        <DataContainer>
          {isLoading && <p>Loading...</p>}
          {error && error instanceof Error ? (
            <p>Error: {error.message}</p>
          ) : null}

          {foods.length > 0
            ? foods.map((item) => (
                <ResultItemContainer key={item.id}>
                  <ResultItem>
                    <FoodName>{item.food_name}</FoodName>
                    <FoodInfo>{item.food_info.join("｜")}</FoodInfo>
                  </ResultItem>
                  <ButtonWrapper>
                    <Button
                      strokeColor="black"
                      label="Add"
                      onClick={() => handleAddFood(item)}
                    />
                  </ButtonWrapper>
                </ResultItemContainer>
              ))
            : triggerSearch && <NoItemsMessage>Searching...</NoItemsMessage>}

          <CreateLinkContainer>
            Can't find it? Try
            <CreateLink onClick={openModal}> adding </CreateLink>
            it.
          </CreateLinkContainer>
        </DataContainer>

        {!triggerSearch && !searchTerm.trim() && (
          <NoDataMessageContainer>
            <NoDataMessage>
              There is currently no food data available. Please enter a keyword
              to search.
            </NoDataMessage>
          </NoDataMessageContainer>
        )}
      </Container>

      {isModalOpen && (
        <Modal title={"Create Food"} onClose={closeModal}>
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
  background-image: url(${BGI});
  margin: 0 0 0 150px;
  height: 100vh;
  z-index: 0;
  @media (max-width: 1000px) {
    margin: 0;
  }
`;
const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin: 50px auto 72px auto;
  width: 90%;
  min-height: 300px;
  padding: 24px 24px;
  background-color: #fff;
  border: 1px solid gray;
  border-radius: 8px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
  @media (max-width: 1000px) {
    margin: 72px 50px 72px 50px;
  }
  @media (max-width: 768px) {
    margin-top: 72px;
  }
  @media (max-width: 480px) {
    margin: 72px 24px 72px 24px;
  }
`;
const Title = styled.h1`
  font-size: 40px;
  margin: 0;
  @media (max-width: 1000px) {
    margin-bottom: 12px;
  }
  @media (max-width: 480px) {
    font-size: 30px;
  }
`;

const Input = styled.input`
  font-family: "KG Second Chances", sans-serif;
  width: 100%;
  padding: 12px 12px 12px 20px;
  margin-bottom: 20px;
  border: 2px solid #ccc;
  border-radius: 4px;
`;

const ErrorMessage = styled.p`
  color: red;
  margin-top: -10px;
  margin-bottom: 10px;
`;

const DataContainer = styled.div`
  max-height: 400px;
  overflow: auto;
  border: 2px solid #ccc;
  padding: 10px;
  border-radius: 4px;

  &::-webkit-scrollbar {
    display: none;
  }

  -ms-overflow-style: none;
  scrollbar-width: none;
`;

const ResultItemContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #ddd;

  margin-bottom: 12px;
  &:hover {
    background-color: #f9f9f9;
  }
`;
const ResultItem = styled.div`
  width: 100%;
  padding: 10px;
  border-radius: 4px;
  background-color: "f0f0f0";

  cursor: pointer;
`;

const FoodName = styled.h3`
  margin: 0;
  font-size: 18px;
`;

const FoodInfo = styled.p`
  margin: 5px 0 0;
  color: #555;
`;

const NoItemsMessage = styled.p`
  margin-top: 20px;
  font-size: 14px;
`;

const NoDataMessageContainer = styled.div`
  margin: 24px 0;
  text-align: center;
  @media (max-width: 1000px) {
    padding: 10px;
    text-align: left;
  }
`;

const NoDataMessage = styled.span`
  font-size: 16px;
  color: #555;
`;

const CreateLinkContainer = styled.h3`
  padding-left: 8px;
  color: gray;
`;

const CreateLink = styled.span`
  color: #007bff;
  cursor: pointer;
`;
const ButtonWrapper = styled.div`
  margin-right: 12px;
  width: 150px;
`;

export default Food;
