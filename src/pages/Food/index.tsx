import React, { useState } from "react";
import styled from "styled-components";
import { useQuery, useQueryClient } from "react-query";
import { auth } from "../../firebase/firebaseConfig";
import { fetchFoodData } from "../../firebase/firebaseServices";
import Sidebar from "../../components/Sidebar";
import Modal from "../../components/Modal";
import CreateFoodModal from "../../components/Ｍodals/CreateFoodModal";
import { useFoodStore } from "../../stores/foodStore";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import BGI from "../../asset/draft.png";
import HamburgerIcon from "../../components/MenuButton";
import Overlay from "../../components/Overlay";

interface FoodItem {
  id: string;
  food_name: string;
  food_info: string[];
}

const Food: React.FC = () => {
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
        <Title>食品資料庫</Title>
        <Input
          type="text"
          placeholder="搜尋食品..."
          value={searchTerm}
          onChange={handleSearch}
          onKeyDown={handleKeyDown}
          onCompositionStart={handleComposition}
          onCompositionEnd={handleComposition}
        />
        {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}

        <DataContainer>
          {isLoading && <p>加載中...</p>}
          {error && error instanceof Error ? (
            <p>發生錯誤: {error.message}</p>
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
                      label="加入菜單"
                      onClick={() => handleAddFood(item)}
                    />
                  </ButtonWrapper>
                </ResultItemContainer>
              ))
            : triggerSearch && <NoItemsMessage>查無結果</NoItemsMessage>}

          <CreateLinkContainer>
            找不到嗎？試試
            <CreateLink onClick={openModal}>新增</CreateLink>
          </CreateLinkContainer>
        </DataContainer>

        {!triggerSearch && !searchTerm.trim() && (
          <NoDataMessageContainer>
            <NoDataMessage>
              目前沒有食品資料，請輸入關鍵字進行查詢
            </NoDataMessage>
          </NoDataMessageContainer>
        )}
      </Container>

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
  background-image: url(${BGI});
  margin: 0 0 0 150px;
  height: 100vh;
  z-index: 0;
  @media (max-width: 1000px) {
    margin: 0;
  }
`;
const Title = styled.h1`
  margin: 12px 0;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 20px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const ErrorMessage = styled.p`
  color: red;
  margin-top: -10px;
  margin-bottom: 10px;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin: 50px auto 72px auto;
  width: 80%;
  min-height: 300px;
  padding: 24px 24px;
  background-color: #fff;
  border: 1px solid gray;
  border-radius: 8px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
  @media (max-width: 1000px) {
    margin: 50px 100px 72px 50px;
  }
`;

const DataContainer = styled.div`
  max-height: 400px;
  overflow: auto;
  border: 1px solid #ddd;
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
  border: 1px solid #ddd;
  &:hover {
    background-color: #f9f9f9;
  }
`;
const ResultItem = styled.div`
  width: 100%;
  margin-bottom: 10px;
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
`;

const NoDataMessage = styled.span`
  font-size: 16px;
  color: #555;
`;

const CreateLinkContainer = styled.h3`
  margin-top: 20px;
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
