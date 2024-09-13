import styled from "styled-components";
import Sidebar from "../../components/Sidebar";

const Calculator = () => {
  return (
    <Wrapper>
      <Sidebar />
      <h1>我是計算機</h1>
    </Wrapper>
  );
};
const Wrapper = styled.div`
  margin-left: 150px;
`;
export default Calculator;
