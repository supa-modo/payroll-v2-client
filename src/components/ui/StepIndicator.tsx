import React from "react";
import { FiCheck } from "react-icons/fi";

interface Step {
  id: number;
  title: string;
  optional?: boolean;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  completedSteps?: number[];
  onStepClick?: (step: number) => void;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
  completedSteps = [],
  onStepClick,
}) => {
  const isCompleted = (stepId: number) => completedSteps.includes(stepId);
  const isCurrent = (stepId: number) => currentStep === stepId;
  const isAccessible = (stepId: number) => 
    isCompleted(stepId) || stepId <= currentStep;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center flex-1">
              <button
                type="button"
                onClick={() => onStepClick && isAccessible(step.id) && onStepClick(step.id)}
                disabled={!isAccessible(step.id) || !onStepClick}
                className={`
                  relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all
                  ${
                    isCompleted(step.id)
                      ? "bg-green-500 border-green-500 text-white"
                      : isCurrent(step.id)
                      ? "bg-blue-500 border-blue-500 text-white ring-4 ring-blue-100"
                      : isAccessible(step.id)
                      ? "bg-white border-gray-300 text-gray-600 hover:border-blue-400 cursor-pointer"
                      : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                  }
                  ${onStepClick && isAccessible(step.id) ? "hover:scale-110" : ""}
                `}
              >
                {isCompleted(step.id) ? (
                  <FiCheck className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-semibold">{step.id}</span>
                )}
                {step.optional && (
                  <span className="absolute -top-1 -right-1 text-xs text-gray-500">*</span>
                )}
              </button>
              <div className="mt-2 text-center">
                <p
                  className={`
                    text-xs font-medium
                    ${
                      isCurrent(step.id)
                        ? "text-blue-600"
                        : isCompleted(step.id)
                        ? "text-green-600"
                        : isAccessible(step.id)
                        ? "text-gray-600"
                        : "text-gray-400"
                    }
                  `}
                >
                  {step.title}
                </p>
                {step.optional && (
                  <p className="text-xs text-gray-400 mt-0.5">Optional</p>
                )}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`
                  flex-1 h-0.5 mx-2 -mt-5
                  ${
                    isCompleted(step.id)
                      ? "bg-green-500"
                      : isAccessible(steps[index + 1]?.id)
                      ? "bg-gray-300"
                      : "bg-gray-200"
                  }
                `}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default StepIndicator;
