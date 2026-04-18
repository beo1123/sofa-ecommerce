"use client";

import React from "react";
import Text from "./Text";
import clsx from "clsx";

type RadioOption = {
  value: string;
  label: string;
  description?: string;
  price?: string;
};

type RadioGroupProps = {
  name: string;
  options: RadioOption[];
  value?: string;
  onChange?: (val: string) => void;
  error?: string;
};

export default function RadioGroup({ name, options, value, onChange, error }: RadioGroupProps) {
  return (
    <div className="space-y-2">
      {options.map((opt) => {
        const checked = value === opt.value;
        return (
          <label
            key={opt.value}
            className={clsx(
              "flex items-center justify-between gap-4 rounded-xl border px-4 py-3 cursor-pointer transition-all",
              checked
                ? "border-[var(--color-brand-300)] bg-[var(--color-brand-50)]"
                : "border-gray-300 hover:border-[var(--color-brand-200)]"
            )}>
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name={name}
                value={opt.value}
                checked={checked}
                onChange={() => onChange?.(opt.value)}
                className="h-4 w-4 text-[var(--color-brand-400)] accent-[var(--color-brand-400)] focus:ring-[var(--color-brand-300)]"
              />
              <div>
                <Text className="font-medium">{opt.label}</Text>
                {opt.description && (
                  <Text muted className="text-sm">
                    {opt.description}
                  </Text>
                )}
              </div>
            </div>
            {opt.price && <Text className="font-semibold">{opt.price}</Text>}
          </label>
        );
      })}
      {error && <Text className="text-red-600 text-sm mt-1">{error}</Text>}
    </div>
  );
}
