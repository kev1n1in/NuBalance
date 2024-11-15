import "flatpickr/dist/themes/airbnb.css";
import Flatpickr from "react-flatpickr";
import styled from "styled-components";
import { DatePickerProps } from "../types/Selectors";

const DatePicker = ({ initialTime, onDateChange }: DatePickerProps) => {
  return (
    <TimePickerContainer>
      <StyledFlatpickr
        value={new Date(initialTime)}
        onChange={(date: Date[]) => onDateChange(date[0])}
        options={{
          inline: true,
          enableTime: true,
          dateFormat: "Y-m-d H:i",
        }}
      />
    </TimePickerContainer>
  );
};

const TimePickerContainer = styled.div`
  display: flex;
  position: relative;
  flex-direction: column;
  width: 30%;
  .flatpickr-calendar.inline {
    top: 60px !important;
  }

  @media (max-width: 768px) {
    margin: 24px 0;
  }
  @media (max-width: 480px) {
    .flatpickr-calendar.inline {
      right: 110px;
      transform: scale(0.8);
    }
  }
  @media (max-width: 360px) {
    margin: 48px 0 0 0;
    .flatpickr-calendar.inline {
      top: 24px !important;
      right: 120px;
      transform: scale(0.7);
    }
  }
  @media (max-width: 300px) {
    margin: 48px 0 0 0;
    .flatpickr-calendar.inline {
      top: 12px !important;
      right: 62px;
      transform: scale(0.6);
    }
  }
`;

const StyledFlatpickr = styled(Flatpickr)`
  font-family: "KG Second Chances", sans-serif;
  position: absolute;
  left: 158px;
  top: -8px;
  height: 50px;
  width: 150px;
  @media (max-width: 480px) {
    top: 24px;
    left: -80px;
  }
  @media (max-width: 360px) {
    top: 0px;
  }
`;

export default DatePicker;
