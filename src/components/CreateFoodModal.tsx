import React from "react";
import Button from "../components/Button";
import styled from "styled-components";

const CreateFoodModal: React.FC = () => {
  return (
    <>
      <Title>新增食品</Title>
      <Form>
        <InputTitle>食品名稱</InputTitle>
        <Input />
        <InputTitle>熱量</InputTitle>
        <Input />
        <InputTitle>碳水</InputTitle>
        <Input />
        <InputTitle>蛋白質</InputTitle>
        <Input />
        <InputTitle>脂肪</InputTitle>
        <Input />
      </Form>
      <Button label="新增" />
    </>
  );
};

const Title = styled.h1`
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 24px;
`;
const Form = styled.form`
  display: flex;
  flex-direction: column;
`;
const InputTitle = styled.div``;
const Input = styled.input``;

export default CreateFoodModal;
