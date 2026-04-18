"use client";

import React, { useState } from "react";
import Text from "@/components/ui/Text";

type Props = {
  min?: number;
  max?: number;
  step?: number;
  value: [number, number];
  onChange: (val: [number, number]) => void;
};

export default function PriceRangeSlider({ min = 0, max = 50000000, step = 500000, value, onChange }: Props) {
  const [minVal, setMinVal] = useState(value[0]);
  const [maxVal, setMaxVal] = useState(value[1]);

  const handleMin = (v: number) => {
    const newVal = Math.min(v, maxVal - step);
    setMinVal(newVal);
    onChange([newVal, maxVal]);
  };

  const handleMax = (v: number) => {
    const newVal = Math.max(v, minVal + step);
    setMaxVal(newVal);
    onChange([minVal, newVal]);
  };

  const leftPercent = ((minVal - min) / (max - min)) * 100;
  const rightPercent = 100 - ((maxVal - min) / (max - min)) * 100;

  return (
    <div className="w-full">
      <Text className="font-medium mb-1">Khoảng giá</Text>

      {/* Display values */}
      <div className="flex justify-between text-sm mb-2">
        <span className="font-semibold text-[var(--color-brand-400)]">{minVal.toLocaleString()} đ</span>
        <span className="font-semibold text-[var(--color-brand-400)]">{maxVal.toLocaleString()} đ</span>
      </div>

      {/* SLIDER */}
      <div className="relative h-3 mt-3 select-none">
        {/* TRACK */}
        <div className="absolute inset-0 bg-gray-200 rounded-full"></div>

        {/* ACTIVE RANGE */}
        <div
          className="absolute h-3 bg-[var(--color-brand-300)] rounded-full"
          style={{
            left: `${leftPercent}%`,
            right: `${rightPercent}%`,
          }}
        />

        {/* MIN THUMB */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={minVal}
          onChange={(e) => handleMin(Number(e.target.value))}
          className="
            absolute w-full appearance-none bg-transparent pointer-events-none p-0
            [&::-webkit-slider-thumb]:pointer-events-auto
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:border
            [&::-webkit-slider-thumb]:border-[var(--color-brand-400)]
            [&::-webkit-slider-thumb]:shadow
            [&::-webkit-slider-thumb]:transition
            [&::-webkit-slider-thumb]:duration-150
            [&::-webkit-slider-thumb]:hover:scale-110
            [&::-webkit-slider-thumb]:mt-[-6px]
          "
          style={{ zIndex: minVal >= max - step * 2 ? 5 : 3 }}
        />

        {/* MAX THUMB */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={maxVal}
          onChange={(e) => handleMax(Number(e.target.value))}
          className="
            absolute w-full appearance-none bg-transparent pointer-events-none p-0
            [&::-webkit-slider-thumb]:pointer-events-auto
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:border
            [&::-webkit-slider-thumb]:border-[var(--color-brand-400)]
            [&::-webkit-slider-thumb]:shadow
            [&::-webkit-slider-thumb]:transition
            [&::-webkit-slider-thumb]:duration-150
            [&::-webkit-slider-thumb]:hover:scale-110
            [&::-webkit-slider-thumb]:mt-[-6px]
          "
          style={{ zIndex: 4 }}
        />
      </div>
    </div>
  );
}
