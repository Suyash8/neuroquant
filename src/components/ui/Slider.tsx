import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChangeValue: (value: number) => void;
  onCommit?: (value: number) => void;
}

export function Slider({
  value,
  min,
  max,
  step = 1,
  onChangeValue,
  onCommit,
  className,
  ...props
}: SliderProps) {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChangeValue(Number(e.target.value))}
      onPointerUp={() => onCommit && onCommit(value)}
      className={cn(
        "w-full h-2 bg-[#050505] rounded-lg appearance-none cursor-pointer border border-white/5",
        "focus:outline-none focus:border-primary/50",
        className
      )}
      style={{
        accentColor: "var(--primary)"
      }}
      {...props}
    />
  );
}
