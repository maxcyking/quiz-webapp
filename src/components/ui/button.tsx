"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-canva text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-canva-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover-lift-canva canva-button-shimmer",
  {
    variants: {
      variant: {
        default: "bg-canva-blue-500 text-white shadow-canva hover:bg-canva-blue-600 hover:shadow-canva-hover hover:-translate-y-0.5",
        destructive:
          "bg-red-500 text-white shadow-sm hover:bg-red-600 hover:shadow-lg hover:-translate-y-0.5",
        outline:
          "border border-canva-blue-300 bg-white text-canva-blue-600 shadow-sm hover:bg-canva-blue-50 hover:shadow-canva hover:-translate-y-0.5",
        secondary:
          "bg-canva-purple-100 text-canva-purple-700 shadow-sm hover:bg-canva-purple-200 hover:shadow-canva-purple hover:-translate-y-0.5",
        ghost: "text-canva-gray-600 hover:bg-canva-blue-50 hover:text-canva-blue-600",
        link: "text-canva-blue-600 underline-offset-4 hover:underline hover:text-canva-blue-700",
        gradient: "bg-gradient-to-r from-canva-blue-500 to-canva-purple-500 text-white shadow-canva hover:from-canva-blue-600 hover:to-canva-purple-600 hover:shadow-canva-hover hover:-translate-y-0.5",
        pink: "bg-canva-pink-400 text-white shadow-canva-pink hover:bg-canva-pink-500 hover:shadow-lg hover:-translate-y-0.5",
        success: "bg-green-500 text-white shadow-sm hover:bg-green-600 hover:shadow-lg hover:-translate-y-0.5",
        primary: "bg-primary text-primary-foreground shadow-canva hover:bg-primary/90 hover:shadow-canva-hover hover:-translate-y-0.5",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-canva-sm px-3 text-xs",
        lg: "h-12 rounded-canva-lg px-8 text-base font-semibold",
        icon: "h-10 w-10",
        xl: "h-14 rounded-canva-lg px-10 text-lg font-semibold",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };