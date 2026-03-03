"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface StepNavigationProps {
    currentStep: number;
    steps: {
        id: number;
        title: string;
        icon: React.ElementType;
    }[];
    onStepClick?: (stepId: number) => void;
}

export default function StepNavigation({ currentStep, steps, onStepClick }: StepNavigationProps) {
    return (
        <div className="flex items-center gap-1 mb-6">
            {steps.map((step, index) => {
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;

                return (
                    <React.Fragment key={step.id}>
                        <button
                            onClick={() => onStepClick?.(step.id)}
                            disabled={!isCompleted && !isActive}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-t-[8px] transition-all duration-200",
                                isActive
                                    ? "bg-primary text-[#00253E] font-semibold"
                                    : "bg-[#00253E] text-white opacity-80 hover:opacity-100"
                            )}
                        >
                            <step.icon className="w-4 h-4" />
                            <span className="text-sm md:text-base whitespace-nowrap">{step.title}</span>
                        </button>
                        {index < steps.length - 1 && (
                            <div className="w-[1px] h-4 bg-gray-300 mx-1 hidden" />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}
