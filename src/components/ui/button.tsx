"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-student text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-student-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 student-button-glow",
  {
    variants: {
      variant: {
        default: "bg-student-blue-500 text-white shadow-student hover:bg-student-blue-600 hover:shadow-lg hover:-translate-y-0.5",
        destructive:
          "bg-red-500 text-white shadow-sm hover:bg-red-600 hover:shadow-lg hover:-translate-y-0.5",
        outline:
          "border border-student-blue-300 bg-white text-student-blue-600 shadow-sm hover:bg-student-blue-50 hover:shadow-student hover:-translate-y-0.5",
        secondary:
          "bg-student-purple-100 text-student-purple-700 shadow-sm hover:bg-student-purple-200 hover:shadow-student-purple hover:-translate-y-0.5",
        ghost: "text-student-gray-600 hover:bg-student-blue-50 hover:text-student-blue-600",
        link: "text-student-blue-600 underline-offset-4 hover:underline hover:text-student-blue-700",
        gradient: "bg-gradient-to-r from-student-blue-500 to-student-purple-500 text-white shadow-student hover:from-student-blue-600 hover:to-student-purple-600 hover:shadow-lg hover:-translate-y-0.5",
        pink: "bg-student-pink-400 text-white shadow-student-pink hover:bg-student-pink-500 hover:shadow-lg hover:-translate-y-0.5",
        success: "bg-green-500 text-white shadow-sm hover:bg-green-600 hover:shadow-lg hover:-translate-y-0.5",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-student-sm px-3 text-xs",
        lg: "h-12 rounded-student-lg px-8 text-base font-semibold",
        icon: "h-10 w-10",
        xl: "h-14 rounded-student-lg px-10 text-lg font-semibold",
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