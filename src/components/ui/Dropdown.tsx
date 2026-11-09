"use client";

import React, { useState, useRef, useEffect, useId } from "react";
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
  const labelId = useId();
  const listboxId = useId();

  // Detect click outside & Escape key
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const selectedOption = options.find((opt) => opt.value === value && opt.value !== "");

  return (
    <div className={`relative flex flex-col gap-1 ${fullWidth ? "w-full" : "w-64"}`} ref={ref}>
      {label && (
        <label id={labelId} className="text-sm font-medium text-[var(--color-text-default)]">
          {label}
        </label>
      )}

      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={label ? labelId : undefined}
        aria-controls={open ? listboxId : undefined}
        onClick={() => setOpen(!open)}
        className={`
          border bg-[var(--color-bg-page)] rounded-2xl px-3.5 py-2.5 flex items-center justify-between
          hover:bg-[var(--color-bg-muted)]
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-300)]
          transition-all cursor-pointer
          disabled:opacity-50 disabled:cursor-not-allowed
          ${open ? "border-[var(--color-brand-300)] ring-2 ring-[var(--color-brand-50)]" : "border-[var(--color-brand-100)]"}
        `}>
        <span className="flex items-center gap-2.5 text-sm font-medium text-[var(--color-text-default)]">
          {selectedOption?.icon}
          {selectedOption ? (
            selectedOption.label
          ) : (
            <span className="text-[var(--color-text-muted)] font-normal">{placeholder}</span>
          )}
        </span>
        <ChevronDown
          size={18}
          className={`text-[var(--color-text-muted)] transition-transform duration-200 ${open ? "rotate-180 text-[var(--color-brand-400)]" : ""}`}
        />
      </button>

      {/* Options Overlay (ABSOLUTE, FLOATING, Z-INDEX HIGH) */}
      {open && (
        <div
          id={listboxId}
          role="listbox"
          aria-labelledby={label ? labelId : undefined}
          className="
            absolute left-0 top-full mt-1.5 w-full max-h-60 overflow-y-auto
            border border-[var(--color-brand-100)] bg-[var(--color-bg-page)] rounded-2xl
            shadow-[0_16px_36px_-12px_color-mix(in_srgb,var(--color-brand-400)_22%,transparent)]
            p-1.5 z-50 animate-fadeIn cursor-pointer
          ">
          {options.map((opt) => (
            <button
              key={opt.value || "__all__"}
              type="button"
              role="option"
              aria-selected={opt.value === (value ?? "")}
              onClick={() => {
                onChange?.(opt.value);
                setOpen(false);
              }}
              className={`
                w-full px-3 py-2 rounded-xl text-left text-sm flex items-center gap-2.5
                hover:bg-[var(--color-bg-muted)]
                focus-visible:outline-none focus-visible:bg-[var(--color-bg-muted)]
                transition-colors
                cursor-pointer
                ${
                  opt.value === (value ?? "")
                    ? "bg-[var(--color-brand-50)] text-[var(--color-brand-400)] font-semibold"
                    : "text-[var(--color-text-default)]"
                }
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
