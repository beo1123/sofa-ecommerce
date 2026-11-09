"use client";

import React, { useEffect, useState } from "react";

type Props = {
  min?: number;
  max?: number;
  step?: number;
  value: [number, number];
  onChange: (val: [number, number]) => void;
};

export default function PriceRangeSlider({ min = 0, max = 50000000, step = 100000, value, onChange }: Props) {
  const [minVal, setMinVal] = useState(value[0]);
  const [maxVal, setMaxVal] = useState(value[1]);

  useEffect(() => {
    setMinVal(value[0]);
    setMaxVal(value[1]);
  }, [value[0], value[1]]);

  const snapValue = (raw: number) => {
    if (raw <= min + step * 0.25) return min;
    if (raw >= max - step * 0.25) return max;
    const snapped = min + Math.round((raw - min) / step) * step;
    return Math.max(min, Math.min(max, snapped));
  };

  const handleMin = (v: number) => {
    const snapped = snapValue(v);
    const newVal = Math.min(snapped, maxVal - step);
    const clamped = Math.max(min, newVal);
    setMinVal(clamped);
    onChange([clamped, maxVal]);
  };

  const handleMax = (v: number) => {
    const snapped = snapValue(v);
    const newVal = Math.max(snapped, minVal + step);
    const clamped = Math.min(max, newVal);
    setMaxVal(clamped);
    onChange([minVal, clamped]);
  };

  const range = Math.max(1, max - min);
  const leftPercent = Math.max(0, Math.min(100, ((minVal - min) / range) * 100));
  const rightPercent = Math.max(0, Math.min(100, 100 - ((maxVal - min) / range) * 100));

  const thumbClasses = `
    absolute inset-0 w-full h-full m-0 appearance-none bg-transparent pointer-events-none p-0
    [&::-webkit-slider-runnable-track]:h-2.5
    [&::-webkit-slider-runnable-track]:rounded-full
    [&::-webkit-slider-runnable-track]:bg-transparent
    [&::-webkit-slider-thumb]:pointer-events-auto
    [&::-webkit-slider-thumb]:appearance-none
    [&::-webkit-slider-thumb]:h-5
    [&::-webkit-slider-thumb]:w-5
    [&::-webkit-slider-thumb]:-mt-[5px]
    [&::-webkit-slider-thumb]:rounded-full
    [&::-webkit-slider-thumb]:cursor-grab
    [&::-webkit-slider-thumb]:active:cursor-grabbing
    [&::-webkit-slider-thumb]:bg-[var(--color-bg-page)]
    [&::-webkit-slider-thumb]:border-2
    [&::-webkit-slider-thumb]:border-[var(--color-brand-400)]
    [&::-webkit-slider-thumb]:shadow-md
    [&::-webkit-slider-thumb]:transition-transform
    [&::-webkit-slider-thumb]:duration-150
    [&::-webkit-slider-thumb]:hover:scale-110
    [&::-moz-range-track]:h-2.5
    [&::-moz-range-track]:rounded-full
    [&::-moz-range-track]:bg-transparent
    [&::-moz-range-thumb]:pointer-events-auto
    [&::-moz-range-thumb]:appearance-none
    [&::-moz-range-thumb]:h-5
    [&::-moz-range-thumb]:w-5
    [&::-moz-range-thumb]:rounded-full
    [&::-moz-range-thumb]:cursor-grab
    [&::-moz-range-thumb]:bg-[var(--color-bg-page)]
    [&::-moz-range-thumb]:border-2
    [&::-moz-range-thumb]:border-[var(--color-brand-400)]
    [&::-moz-range-thumb]:shadow-md
  `;

  return (
    <div className="w-full space-y-3">
      {/* 2-Column Bento Price Value Display */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="rounded-xl bg-[var(--color-bg-page)] px-3 py-2 ring-1 ring-[var(--color-brand-50)]">
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
            Từ mức giá
          </span>
          <span className="mt-0.5 block text-xs sm:text-sm font-bold text-[var(--color-brand-400)] whitespace-nowrap">
            {minVal.toLocaleString("vi-VN")} ₫
          </span>
        </div>

        <div className="rounded-xl bg-[var(--color-bg-page)] px-3 py-2 ring-1 ring-[var(--color-brand-50)]">
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
            Đến mức giá
          </span>
          <span className="mt-0.5 block text-xs sm:text-sm font-bold text-[var(--color-brand-400)] whitespace-nowrap">
            {maxVal.toLocaleString("vi-VN")} ₫
          </span>
        </div>
      </div>

      {/* SLIDER — step={1} on input so maxVal===max always sits at exact 100% right edge */}
      <div className="relative flex items-center h-6 mx-1 select-none">
        {/* TRACK */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-2.5 bg-[var(--color-brand-100)]/60 rounded-full" />

        {/* ACTIVE RANGE */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-2.5 bg-[var(--color-brand-400)] rounded-full"
          style={{
            left: `${leftPercent}%`,
            right: `${rightPercent}%`,
          }}
        />

        {/* MIN THUMB */}
        <input
          type="range"
          aria-label="Giá tối thiểu"
          min={min}
          max={max}
          step={1}
          value={minVal}
          onChange={(e) => handleMin(Number(e.target.value))}
          className={thumbClasses}
          style={{ zIndex: minVal >= max - step * 2 ? 5 : 3 }}
        />

        {/* MAX THUMB */}
        <input
          type="range"
          aria-label="Giá tối đa"
          min={min}
          max={max}
          step={1}
          value={maxVal}
          onChange={(e) => handleMax(Number(e.target.value))}
          className={thumbClasses}
          style={{ zIndex: 4 }}
        />
      </div>
    </div>
  );
}
