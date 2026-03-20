"use client";

import { FaCheck, FaChevronRight } from "react-icons/fa";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";

export interface StepperItem {
  id: string;
  title: string;
  description?: string;
}

interface StepperProps {
  items: StepperItem[];
  currentStep: number;
  className?: string;
  orientation?: "horizontal" | "vertical";
  showDescriptions?: boolean;
}

export function Stepper({
  items,
  currentStep,
  className,
  orientation = "horizontal",
}: StepperProps) {
  const progress = ((currentStep + 1) / items.length) * 100;

  if (orientation === "vertical") {
    return (
      <div className={cn("space-y-1", className)}>
        {/* Progress Bar */}
        <div className="mb-6 overflow-hidden rounded-full bg-gray-200">
          <motion.div
            className="h-2 bg-gradient-to-r from-orange-500 to-orange-600"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>

        <ol className="space-y-2" aria-label="Sign up steps">
          {items.map((item, index) => {
            const isComplete = index < currentStep;
            const isCurrent = index === currentStep;

            return (
              <motion.li
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "group relative flex items-start gap-4 rounded-sm border p-4 transition-all",
                  isCurrent &&
                    "border-primary/30 bg-gradient-to-r from-primary/5 to-white shadow-sm",
                  isComplete && "border-primary/20 bg-primary/5",
                  !isCurrent && !isComplete && "border-gray-200 bg-white",
                )}
              >
                {/* Step Indicator */}
                <div className="relative flex shrink-0">
                  <motion.div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all",
                      isCurrent &&
                        "border-primary bg-primary text-white shadow-lg shadow-primary/20",
                      isComplete &&
                        "border-primary bg-primary text-white",
                      !isCurrent &&
                        !isComplete &&
                        "border-gray-300 bg-white text-gray-500",
                    )}
                    animate={isCurrent ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                    transition={{
                      duration: 0.5,
                      repeat: isCurrent ? Infinity : 0,
                      repeatDelay: 2,
                    }}
                  >
                    {isComplete ? (
                      <FaCheck className="h-5 w-5" strokeWidth={3} />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </motion.div>

                  {/* Connector Line */}
                  {index < items.length - 1 && (
                    <div
                      className={cn(
                        "absolute left-5 top-10 h-8 w-0.5 -translate-x-1/2",
                        isComplete ? "bg-primary/30" : "bg-gray-200",
                      )}
                    />
                  )}
                </div>

                {/* Step Content */}
                <div className="flex-1 pt-1">
                  <p
                    className={cn(
                      "font-semibold transition-colors",
                      isCurrent && "text-primary",
                      isComplete && "text-primary",
                      !isCurrent && !isComplete && "text-gray-600",
                    )}
                  >
                    {item.title}
                  </p>
                  {item.description && (
                    <p
                      className={cn(
                        "mt-0.5 text-sm",
                        isCurrent ? "text-primary/80" : "text-gray-500",
                      )}
                    >
                      {item.description}
                    </p>
                  )}
                </div>

                {/* Active Indicator Arrow */}
                {isCurrent && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-primary"
                  >
                    <FaChevronRight className="h-5 w-5" strokeWidth={2.5} />
                  </motion.div>
                )}
              </motion.li>
            );
          })}
        </ol>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
 
      {/* Stepper Steps */}
      <ol
        className="mx-auto flex w-full items-center justify-center"
        aria-label="Sign up steps"
      >
        {items.map((item, index) => {
          const isComplete = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <li
              key={item.id}
              className={cn(
                "flex items-center",
                index < items.length - 1 && "flex-1",
              )}
            >
              <motion.div
                className={cn(
                  "flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full text-xs sm:text-sm font-bold transition-all",
                  isCurrent &&
                    "bg-primary text-white shadow-md shadow-primary/20",
                  isComplete && "bg-primary text-white",
                  !isCurrent && !isComplete && "bg-gray-200 text-gray-600",
                )}
                animate={isCurrent ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                transition={{
                  duration: 0.5,
                  repeat: isCurrent ? Infinity : 0,
                  repeatDelay: 2,
                }}
              >
                {isComplete ? (
                  <FaCheck className="h-4 w-4" strokeWidth={3} />
                ) : (
                  <span>{index + 1}</span>
                )}
              </motion.div>
              {index < items.length - 1 && (
                <div className="mx-1.5 sm:mx-2 h-0.5 flex-1 bg-gray-200">
                  <div
                    className={cn(
                      "h-full",
                      isComplete ? "bg-primary/30" : "bg-transparent",
                    )}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
