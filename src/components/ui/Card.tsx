"use client";
import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "bordered" | "elevated";
  padding?: "none" | "sm" | "md" | "lg";
  hoverable?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, variant = "default", padding = "md", hoverable = false, className = "", ...props }, ref) => {
    const baseClasses = "rounded-lg bg-[var(--color-bg-page)] transition-shadow";
    const variantClasses = {
      default: "border border-[var(--color-brand-50)]",
      bordered: "border-2 border-[var(--color-brand-200)]",
      elevated: "shadow-md",
    };
    const paddingClasses = { none: "", sm: "p-3", md: "p-4", lg: "p-6" };
    const hoverClass = hoverable ? "hover:shadow-lg hover:border-[var(--color-brand-300)] cursor-pointer" : "";
    const classes = `${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${hoverClass} ${className}`;

    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    );
  }
);

export const CardHeader = ({ children, className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`border-b border-[var(--color-brand-50)] pb-3 mb-3 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = "", ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={`text-lg font-semibold text-[var(--color-text-default)] ${className}`} {...props}>
    {children}
  </h3>
);

export const CardFooter = ({ children, className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`border-t border-[var(--color-brand-50)] pt-3 mt-3 ${className}`} {...props}>
    {children}
  </div>
);

export const CardContent = ({ children, className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`text-[var(--text-base)] leading-relaxed ${className}`} {...props}>
    {children}
  </div>
);

Card.displayName = "Card";
export default Card;
