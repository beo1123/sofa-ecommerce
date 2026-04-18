// components/Text.tsx
import React from "react";

type Props = {
  children: React.ReactNode;
  muted?: boolean;
  size?: "sm" | "md" | "lg";
  as?: "p" | "div" | "span";
  className?: string;
};

export default function Text({ children, muted = false, size = "md", as = "p", className = "" }: Props) {
  const sizeMap = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const colorClass = muted ? "text-[var(--color-text-muted)]" : "text-[var(--color-text-default)]";

  const Component = as;

  return <Component className={`${sizeMap[size]} ${colorClass} ${className}`}>{children}</Component>;
}
