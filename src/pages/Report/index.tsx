import styled from "styled-components";
import Sidebar from "../../components/Sidebar";
const Report = () => {
  return (
    <Wrapper>
      <Sidebar />
      <h1>我是分析報告</h1>
    </Wrapper>
  );
};
const Wrapper = styled.div`
  margin-left: 150px;
`;
export default Report;
