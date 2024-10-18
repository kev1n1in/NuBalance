import { useState, useEffect } from "react";
import ReactJoyride, { CallBackProps, STATUS, Step } from "react-joyride";

interface JoyrideProps {
  run: boolean;
  setRun: (run: boolean) => void;
}

const Joyride = ({ run, setRun }: JoyrideProps) => {
  const [steps, setSteps] = useState<Step[]>([]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data as { status: "finished" | "skipped" | "error" };
    if (["finished", "skipped"].includes(status)) {
      setRun(false);
    }
  };
  useEffect(() => {
    setSteps([
      {
        target: ".calculate-tdee-button",
        content:
          "Click here to calculate your Total Daily Energy Expenditure (TDEE).",
        placement: "top",
        spotlightPadding: 10,
      },
      {
        target: ".search-food-button",
        content: "Click here to search for food nutrients and calories.",
        placement: "top",
        spotlightPadding: 10,
      },
      {
        target: ".create-diary-button",
        content: "Click here to create a new diary entry.",
        placement: "top",
        spotlightPadding: 10,
      },
      {
        target: ".check-report-button",
        content: "Click here to check your detailed progress report.",
        placement: "top",
        spotlightPadding: 10,
      },
    ]);
    setRun(false);
  }, []);

  return (
    <ReactJoyride
      continuous={true}
      run={run}
      steps={steps}
      callback={handleJoyrideCallback}
      showSkipButton={true}
      showProgress={true}
      styles={{
        options: {
          zIndex: 10000,
          arrowColor: "#eee",
          backgroundColor: "#fff",
          overlayColor: "rgba(54, 54, 54, 0.4)",
          primaryColor: "#ff0000",
          textColor: "#333",
          spotlightShadow: "0 0 15px rgba(255, 0, 0, 0.8)",
        },
      }}
    />
  );
};

export default Joyride;
