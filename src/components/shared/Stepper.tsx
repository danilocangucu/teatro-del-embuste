import { shopSteps } from "@/utils/constants";

interface StepperProps {
  currentStep: string;
}

export function Stepper({ currentStep }: StepperProps) {
  return (
    <nav style={{ display: "flex", gap: "1rem", justifyContent: "center", marginBottom: "2rem" }}>
      {shopSteps.map((step) => {
        const isActive = step === currentStep;
        return (
          <div key={step} style={{
            fontWeight: isActive ? "bold" : "normal",
            color: isActive ? "#000" : "#888",
            borderBottom: isActive ? "2px solid black" : "none",
            paddingBottom: "0.25rem"
          }}>
            {step}
          </div>
        );
      })}
    </nav>
  );
}
