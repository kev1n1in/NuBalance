import React from "react";
import styled from "styled-components";

interface SliderProps {
  value: number;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  min: number;
  max: number;
}

const StyledSlider = styled.input.attrs({ type: "range" })`
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  outline: 0;
  width: 100%;
  height: 12px;
  background: #f0f0f0;
  border: 2px dashed #000;
  box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.2);

  &::-webkit-slider-runnable-track {
    height: 24px;

    background: white;
    border: 2px dashed #000;
  }

  &::-moz-range-track {
    height: 12px;
    border-radius: 40px;
    background: linear-gradient(90deg, #e0e0e0 0%, #f0f0f0 100%);
    border: 2px dashed #000;
  }

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    position: relative;
    bottom: 4px;
    width: 30px;
    height: 30px;
    background: rgb(0, 0, 0, 0.8);
    border-radius: 50%;
    border: 2px dashed #000;
    box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 30px;
    height: 30px;
    background: #fff;
    border-radius: 50%;
    border: 2px solid #000;
    box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
    cursor: pointer;
  }

  &::-ms-thumb {
    width: 30px;
    height: 30px;
    background: #fff;
    border-radius: 50%;
    border: 2px solid #000;
    box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
    cursor: pointer;
  }
`;

const Slider = ({ value, onChange, min, max }: SliderProps) => {
  return <StyledSlider value={value} onChange={onChange} min={min} max={max} />;
};

export default Slider;
