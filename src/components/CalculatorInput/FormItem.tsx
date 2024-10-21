import React from "react";
import styled from "styled-components";
import { FormItemProps } from "../../types/TDEEForm";
import RequiredMark from "../RequiredMark";
import Slider from "./Slider";

const FormItem = ({
  title,
  value,
  min,
  max,
  onChange,
  required,
}: FormItemProps) => {
  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(event.target.value));
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(event.target.value.replace(/[^0-9]/g, "")));
  };

  return (
    <Wrapper>
      <FormTitle>
        {title}
        {required && <RequiredMark />}
      </FormTitle>
      <SliderWrapper>
        <Slider
          value={value}
          min={min}
          max={max}
          onChange={handleSliderChange}
        />
      </SliderWrapper>
      <Input
        type="text"
        value={value.toString()}
        onChange={handleInputChange}
      />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 12px 0;
  width: 100%;
  gap: 24px;
  @media (max-width: 768px) {
    align-items: start;
    flex-direction: column;
  }
`;
const FormTitle = styled.span`
  font-size: 36px;
  margin-right: 24px;
  width: 170px;
  color: black;
  @media (max-width: 480px) {
    font-size: 24px;
  }
`;
const SliderWrapper = styled.div`
  flex-grow: 1;
  @media (max-width: 768px) {
    width: 100%;
  }
`;
const Input = styled.input`
  width: 100px;
  padding: 8px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  text-align: center;
  font-family: "KG Second Chances";
`;

export default FormItem;
