import { motion } from "framer-motion";
import { forwardRef, useEffect, useRef } from "react";
import { annotate } from "rough-notation";
import styled from "styled-components";
import { MoodItem, MoodSelectorProps } from "../types/Selectors";

const MoodSelector = forwardRef(
  ({ moods, selectedMood, setSelectedMoodClick }: MoodSelectorProps) => {
    const moodRefs = useRef<Array<HTMLDivElement | null>>(
      new Array(moods.length).fill(null)
    );
    const annotations = useRef<any[]>(new Array(moods.length).fill(null));

    const handleMoodClick = (mood: MoodItem) => {
      const isSelected = selectedMood?.id === mood.id;
      setSelectedMoodClick(isSelected ? null : mood);
    };
    useEffect(() => {
      moodRefs.current.forEach((moodRef, index) => {
        const mood = moods[index];
        if (moodRef && selectedMood && mood.id === selectedMood.id) {
          const annotation = annotate(moodRef, {
            type: "circle",
            color: "#709a46",
            padding: 8,
            animationDuration: 300,
          });
          annotation.show();
          annotations.current[index] = annotation;
        } else if (annotations.current[index]) {
          annotations.current[index].remove();
          annotations.current[index] = null;
        }
      });

      return () => {
        annotations.current.forEach((annotation) => {
          if (annotation) annotation.remove();
        });
      };
    }, [selectedMood, moods]);
    return (
      <MoodSelectorContainer>
        {moods.map((mood, index) => (
          <MoodContainer
            key={mood.id}
            onClick={() => handleMoodClick(mood)}
            isSelected={selectedMood?.id === mood.id}
            ref={(el) => (moodRefs.current[index] = el)}
          >
            <Mood src={mood.imgSrc} alt={mood.name} />
          </MoodContainer>
        ))}
      </MoodSelectorContainer>
    );
  }
);

const MoodSelectorContainer = styled.div`
  display: flex;
  justify-content: space-between;
  @media (max-width: 768px) {
    width: 100%;
    flex-wrap: wrap;
    justify-content: start;
  }
`;

const MoodContainer = styled(motion.div).attrs<{ isSelected: boolean }>(
  ({ isSelected }) => ({
    initial: { scale: 1 },
    animate: { scale: isSelected ? 1.3 : 1 },
    transition: { type: "spring", stiffness: 300 },
  })
)<{ isSelected: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 12px 10px 0 10px;
  cursor: pointer;
`;

const Mood = styled.img`
  width: 50px;
  height: auto;
  @media (max-width: 480px) {
    width: 46px;
  }
  @media (max-width: 360px) {
    width: 42px;
  }
`;

export default MoodSelector;
