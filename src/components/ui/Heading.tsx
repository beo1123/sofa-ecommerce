// components/Heading.tsx
import React from "react";

type Props = {
  children: React.ReactNode;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
};

export default function Heading({ children, level = 2, className = "" }: Props) {
  const sizeMap: Record<number, string> = {
    1: "text-4xl font-bold",
    2: "text-3xl font-semibold",
    3: "text-2xl font-semibold",
    4: "text-xl font-medium",
    5: "text-lg font-medium",
    6: "text-base font-medium",
  };

  return <div className={`${sizeMap[level]} text-[var(--color-text-default)] ${className}`}>{children}</div>;
}
