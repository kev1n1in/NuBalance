import styled from "styled-components";
import Sidebar from "../../components/Sidebar";
const Diary = () => {
  return (
    <Wrapper>
      <Sidebar />
      <h1>我是日記啦</h1>
    </Wrapper>
  );
};
const Wrapper = styled.div`
  margin-left: 150px;
`;
export default Diary;
