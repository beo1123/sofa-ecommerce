"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

type Option = {
  label: string;
  value: string;
  icon?: React.ReactNode;
};

type Props = {
  label?: string;
  placeholder?: string;
  options: Option[];
  value?: string;
  onChange?: (value: string) => void;
  fullWidth?: boolean;
  disabled?: boolean;
};

export default function Dropdown({
  label,
  placeholder = "Select an option",
  options,
  value,
  onChange,
  fullWidth,
  disabled,
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Detect click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={`relative flex flex-col gap-1 ${fullWidth ? "w-full" : "w-64"}`} ref={ref}>
      {label && <label className="text-sm font-medium">{label}</label>}

      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className={`
          border bg-white rounded-md px-3 py-2 flex items-center justify-between
          hover:bg-[var(--color-bg-muted)]
          transition-colors cursor-pointer
          disabled:opacity-50 disabled:cursor-not-allowed
          ${open ? "border-[var(--color-brand-300)]" : "border-gray-300"}
        `}>
        <span className="flex items-center gap-2 text-sm">
          {selectedOption?.icon}
          {selectedOption ? selectedOption.label : <span className="text-gray-400">{placeholder}</span>}
        </span>
        <ChevronDown size={18} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Options Overlay (ABSOLUTE, FLOATING, Z-INDEX HIGH) */}
      {open && (
        <div
          className="
            absolute left-0 top-full mt-1 w-full
            border bg-white rounded-md shadow-lg z-50
            animate-fadeIn overflow-hidden cursor-pointer
          ">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange?.(opt.value);
                setOpen(false);
              }}
              className={`
                w-full px-3 py-2 text-left text-sm flex items-center gap-2
                hover:bg-[var(--color-brand-50)]
                transition-colors
                cursor-pointer
                ${opt.value === value ? "bg-[var(--color-brand-100)]" : ""}
              `}>
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
