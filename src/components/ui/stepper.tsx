"use client";

import { Check, ChevronRight } from "lucide-react";
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
                  "group relative flex items-start gap-4 rounded-2xl border p-4 transition-all",
                  isCurrent &&
                    "border-orange-300 bg-gradient-to-r from-orange-50 to-white shadow-sm",
                  isComplete && "border-orange-200 bg-orange-50/50",
                  !isCurrent && !isComplete && "border-gray-200 bg-white",
                )}
              >
                {/* Step Indicator */}
                <div className="relative flex shrink-0">
                  <motion.div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all",
                      isCurrent &&
                        "border-orange-500 bg-orange-500 text-white shadow-lg shadow-orange-200",
                      isComplete &&
                        "border-orange-500 bg-orange-500 text-white",
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
                      <Check className="h-5 w-5" strokeWidth={3} />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </motion.div>

                  {/* Connector Line */}
                  {index < items.length - 1 && (
                    <div
                      className={cn(
                        "absolute left-5 top-10 h-8 w-0.5 -translate-x-1/2",
                        isComplete ? "bg-orange-300" : "bg-gray-200",
                      )}
                    />
                  )}
                </div>

                {/* Step Content */}
                <div className="flex-1 pt-1">
                  <p
                    className={cn(
                      "font-semibold transition-colors",
                      isCurrent && "text-orange-700",
                      isComplete && "text-orange-600",
                      !isCurrent && !isComplete && "text-gray-600",
                    )}
                  >
                    {item.title}
                  </p>
                  {item.description && (
                    <p
                      className={cn(
                        "mt-0.5 text-sm",
                        isCurrent ? "text-orange-600/80" : "text-gray-500",
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
                    className="text-orange-500"
                  >
                    <ChevronRight className="h-5 w-5" strokeWidth={2.5} />
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
        className="mx-auto flex w-fit items-center justify-center"
        aria-label="Sign up steps"
      >
        {items.map((item, index) => {
          const isComplete = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <li key={item.id} className="flex items-center">
              <motion.div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all",
                  isCurrent &&
                    "bg-orange-500 text-white shadow-md shadow-orange-200",
                  isComplete && "bg-orange-500 text-white",
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
                  <Check className="h-4 w-4" strokeWidth={3} />
                ) : (
                  <span>{index + 1}</span>
                )}
              </motion.div>
              {index < items.length - 1 && (
                <div className="mx-3 h-0.5 w-12 bg-gray-200">
                  <div
                    className={cn(
                      "h-full",
                      isComplete ? "bg-orange-300" : "bg-transparent",
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
