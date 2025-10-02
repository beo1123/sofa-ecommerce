// components/Button.tsx
import React from "react";
import clsx from "clsx";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export default function Button({
  variant = "primary",
  className,
  ...rest
}: Props) {
  const base =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors px-4 py-2 cursor-pointer";
  const variants: Record<string, string> = {
    primary: "bg-brand-200 text-white hover:bg-brand-300",
    secondary:
      "bg-brand-50 text-brand-400 hover:bg-brand-100 border border-brand-200",
  };

  return (
    <button className={clsx(base, variants[variant], className)} {...rest} />
  );
}
