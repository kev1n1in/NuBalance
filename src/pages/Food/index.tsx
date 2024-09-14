import React, { useState } from "react";
import styled from "styled-components";
import { useQuery } from "react-query";
import { auth } from "../../firebase/firebaseConfig";
import { fetchFoodData } from "../../firebase/firebaseServices";
import Sidebar from "../../components/Sidebar";
import Modal from "../../components/Modal";
import CreateFoodModal from "../../components/CreateFoodModal";

const Food: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null); // 追蹤選中的項目
  const currentUser = auth.currentUser;

  const {
    data: foods = [],
    isLoading,
    error,
  } = useQuery(
    ["foods", searchTerm],
    () => fetchFoodData(searchTerm, currentUser?.uid || ""),
    {
      enabled: searchTerm.length > 0,
    }
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleItemClick = (id: string) => {
    setSelectedItem(id); // 點擊後設置選中的項目
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <Wrapper>
      <Sidebar />
      <h1>我是食品資料庫啦</h1>
      <Container>
        <Input
          type="text"
          placeholder="搜尋食品..."
          value={searchTerm}
          onChange={handleSearch}
        />
        <DataContainer>
          {isLoading && <p>加載中...</p>}
          {error && error instanceof Error ? (
            <p>發生錯誤: {error.message}</p>
          ) : (
            <p>發生未知錯誤</p>
          )}

          {foods.length > 0 ? (
            foods.map((item) => (
              <ResultItem
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                isSelected={selectedItem === item.id} // 根據選中狀態設置樣式
              >
                <FoodName>{item.food_name}</FoodName>
                <FoodInfo>{item.food_info.join("｜")}</FoodInfo>
              </ResultItem>
            ))
          ) : (
            <NoItemsMessage>
              找不到嗎？試試<CreateLink onClick={openModal}>新增</CreateLink>
            </NoItemsMessage>
          )}
        </DataContainer>
      </Container>
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
  margin-left: 150px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 20px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Container = styled.div`
  flex: 1;
  padding: 20px;
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

const ResultItem = styled.div<{ isSelected: boolean }>`
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: ${({ isSelected }) =>
    isSelected ? "#f0f0f0" : "white"}; // 選中後背景變為淺灰色
  cursor: pointer;

  &:hover {
    background-color: #f9f9f9; // 懸停時背景變化
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

const NoItemsMessage = styled.p``;
const CreateLink = styled.span`
  color: #007bff;
  cursor: pointer;
`;

export default Food;
