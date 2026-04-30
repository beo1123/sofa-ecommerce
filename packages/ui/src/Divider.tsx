// components/Divider.tsx
import React from "react";

type Props = {
  className?: string;
  vertical?: boolean;
};

export default function Divider({ className = "", vertical = false }: Props) {
  const base = vertical ? "w-px h-full bg-brand-100" : "h-px w-full bg-brand-100";

  return <div className={`${base} ${className}`} role="separator" />;
}
