// components/Container.tsx
import React from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function Container({ children, className = "" }: Props) {
  return (
    <div
      className={`
        w-full
        sm:max-w-7xl sm:mx-auto sm:px-6 lg:px-8
        ${className}
      `}>
      {children}
    </div>
  );
}
