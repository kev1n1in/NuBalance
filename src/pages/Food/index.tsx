import styled from "styled-components";
import Sidebar from "../../components/Sidebar";
const Food = () => {
  return (
    <Wrapper>
      <Sidebar />
      <h1>我是食品資料庫啦</h1>
    </Wrapper>
  );
};
const Wrapper = styled.div`
  margin-left: 150px;
`;
export default Food;
