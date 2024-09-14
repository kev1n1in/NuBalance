import React, { useState } from "react";
import styled from "styled-components";
import { useQuery } from "react-query";
import {
  db,
  collection,
  query,
  where,
  getDocs,
} from "../../firebase/firebaseConfig";
import Sidebar from "../../components/Sidebar";
import Modal from "../../components/Modal";
import CreateFoodModal from "../../components/CreateFoodModal"; // 確保正確導入 CreateFoodModal

interface FoodItem {
  id: string;
  food_name: string;
  food_info: string[];
}

const fetchFoodData = async (searchTerm: string): Promise<FoodItem[]> => {
  const foodsCol = collection(db, "foods");

  const q = query(
    foodsCol,
    where("food_name", ">=", searchTerm.toLowerCase()),
    where("food_name", "<=", searchTerm.toLowerCase() + "\uf8ff")
  );

  const foodSnapshot = await getDocs(q);
  const foodList = foodSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<FoodItem, "id">),
  }));

  return foodList;
};

const Food: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const {
    data: foods = [],
    isLoading,
    error,
  } = useQuery(["foods", searchTerm], () => fetchFoodData(searchTerm), {
    enabled: searchTerm.length > 0,
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
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
              <ResultItem key={item.id}>
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
          <CreateFoodModal />
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

const ResultItem = styled.div`
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
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
