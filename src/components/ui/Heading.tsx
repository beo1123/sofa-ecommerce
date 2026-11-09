// components/Heading.tsx
import React from "react";

type Props = {
  children: React.ReactNode;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
};

export default function Heading({ children, level = 2, className = "" }: Props) {
  const sizeMap: Record<number, string> = {
    1: "text-3xl sm:text-4xl font-bold tracking-tight",
    2: "text-2xl sm:text-3xl font-semibold tracking-tight",
    3: "text-xl sm:text-2xl font-semibold",
    4: "text-lg sm:text-xl font-medium",
    5: "text-base sm:text-lg font-medium",
    6: "text-base font-medium",
  };

  const Tag = `h${level}` as const;

  return <Tag className={`${sizeMap[level]} ${className}`}>{children}</Tag>;
}
