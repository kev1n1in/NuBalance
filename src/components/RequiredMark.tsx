import styled from "styled-components";

const RequiredMark = () => {
  return <RequiredStar>*</RequiredStar>;
};
const RequiredStar = styled.span`
  position: relative;
  bottom: 4px;
  color: red;
  margin-left: 4px;
`;
export default RequiredMark;
