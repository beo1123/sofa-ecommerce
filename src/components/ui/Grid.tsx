import React from "react";

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 6 | 12;
  gap?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
  responsive?: {
    sm?: 1 | 2 | 3 | 4 | 6 | 12;
    md?: 1 | 2 | 3 | 4 | 6 | 12;
    lg?: 1 | 2 | 3 | 4 | 6 | 12;
    xl?: 1 | 2 | 3 | 4 | 6 | 12;
  };
}

const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ children, cols = 1, gap = "md", responsive, className = "", ...props }, ref) => {
    const baseClasses = "grid";

    // Gap classes
    const gapClasses = {
      none: "gap-0",
      xs: "gap-1",
      sm: "gap-2",
      md: "gap-4",
      lg: "gap-6",
      xl: "gap-8",
    };

    // Column classes
    const colClasses = {
      1: "grid-cols-1",
      2: "grid-cols-2",
      3: "grid-cols-3",
      4: "grid-cols-4",
      6: "grid-cols-6",
      12: "grid-cols-12",
    };

    // Build responsive classes
    let responsiveClasses = "";
    if (responsive) {
      if (responsive.sm) responsiveClasses += ` sm:grid-cols-${responsive.sm}`;
      if (responsive.md) responsiveClasses += ` md:grid-cols-${responsive.md}`;
      if (responsive.lg) responsiveClasses += ` lg:grid-cols-${responsive.lg}`;
      if (responsive.xl) responsiveClasses += ` xl:grid-cols-${responsive.xl}`;
    }

    const classes = `${baseClasses} ${colClasses[cols]} ${gapClasses[gap]}${responsiveClasses} ${className}`;

    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    );
  }
);

Grid.displayName = "Grid";

// GridItem component for more control
export interface GridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  colSpan?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  rowSpan?: 1 | 2 | 3 | 4 | 5 | 6;
  responsive?: {
    sm?: { colSpan?: number; rowSpan?: number };
    md?: { colSpan?: number; rowSpan?: number };
    lg?: { colSpan?: number; rowSpan?: number };
    xl?: { colSpan?: number; rowSpan?: number };
  };
}

export const GridItem = React.forwardRef<HTMLDivElement, GridItemProps>(
  ({ children, colSpan, rowSpan, responsive, className = "", ...props }, ref) => {
    let classes = "";

    // Column span
    if (colSpan) classes += ` col-span-${colSpan}`;

    // Row span
    if (rowSpan) classes += ` row-span-${rowSpan}`;

    // Responsive spans
    if (responsive) {
      if (responsive.sm?.colSpan) classes += ` sm:col-span-${responsive.sm.colSpan}`;
      if (responsive.sm?.rowSpan) classes += ` sm:row-span-${responsive.sm.rowSpan}`;
      if (responsive.md?.colSpan) classes += ` md:col-span-${responsive.md.colSpan}`;
      if (responsive.md?.rowSpan) classes += ` md:row-span-${responsive.md.rowSpan}`;
      if (responsive.lg?.colSpan) classes += ` lg:col-span-${responsive.lg.colSpan}`;
      if (responsive.lg?.rowSpan) classes += ` lg:row-span-${responsive.lg.rowSpan}`;
      if (responsive.xl?.colSpan) classes += ` xl:col-span-${responsive.xl.colSpan}`;
      if (responsive.xl?.rowSpan) classes += ` xl:row-span-${responsive.xl.rowSpan}`;
    }

    return (
      <div ref={ref} className={`${classes} ${className}`.trim()} {...props}>
        {children}
      </div>
    );
  }
);

GridItem.displayName = "GridItem";

export default Grid;
