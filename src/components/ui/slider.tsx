"use client";

import * as SliderPrimitive from "@radix-ui/react-slider";
import * as React from "react";

import { cn } from "@/lib/utils";

export interface SliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  variant?: "default" | "gradient" | "minimal";
  size?: "sm" | "md" | "lg";
  color?: "blue" | "purple" | "orange" | "green" | "red" | "gray";
}

const Slider = React.forwardRef<
  React.ComponentRef<typeof SliderPrimitive.Root>,
  SliderProps
>(
  (
    { className, variant = "default", size = "md", color = "blue", ...props },
    ref
  ) => {
    const sizeClasses = {
      sm: "h-1",
      md: "h-2",
      lg: "h-3",
    };

    const thumbSizeClasses = {
      sm: "h-4 w-4",
      md: "h-5 w-5",
      lg: "h-6 w-6",
    };

    const colorClasses = {
      blue: {
        track: "bg-gradient-to-r from-blue-100 to-blue-200",
        range: "bg-gradient-to-r from-blue-500 to-blue-600",
        thumb: "border-blue-500 hover:border-blue-600 focus:border-blue-600",
      },
      purple: {
        track: "bg-gradient-to-r from-purple-100 to-purple-200",
        range: "bg-gradient-to-r from-purple-500 to-purple-600",
        thumb:
          "border-purple-500 hover:border-purple-600 focus:border-purple-600",
      },
      orange: {
        track: "bg-gradient-to-r from-orange-100 to-orange-200",
        range: "bg-gradient-to-r from-orange-500 to-orange-600",
        thumb:
          "border-orange-500 hover:border-orange-600 focus:border-orange-600",
      },
      green: {
        track: "bg-gradient-to-r from-green-100 to-green-200",
        range: "bg-gradient-to-r from-green-500 to-green-600",
        thumb: "border-green-500 hover:border-green-600 focus:border-green-600",
      },
      red: {
        track: "bg-gradient-to-r from-red-100 to-red-200",
        range: "bg-gradient-to-r from-red-500 to-red-600",
        thumb: "border-red-500 hover:border-red-600 focus:border-red-600",
      },
      gray: {
        track: "bg-gradient-to-r from-gray-100 to-gray-200",
        range: "bg-gradient-to-r from-gray-500 to-gray-600",
        thumb: "border-gray-500 hover:border-gray-600 focus:border-gray-600",
      },
    };

    const variantClasses = {
      default: {
        track: "bg-secondary",
        range: "bg-primary",
        thumb: "border-primary hover:border-primary/80 focus:border-primary",
      },
      gradient: {
        track: colorClasses[color].track,
        range: colorClasses[color].range,
        thumb: colorClasses[color].thumb,
      },
      minimal: {
        track: "bg-gray-200",
        range: "bg-gray-400",
        thumb: "border-gray-400 hover:border-gray-500 focus:border-gray-500",
      },
    };

    const currentVariant = variantClasses[variant];

    return (
      <SliderPrimitive.Root
        ref={ref}
        className={cn(
          "relative flex w-full touch-none select-none items-center group",
          className
        )}
        {...props}
      >
        <SliderPrimitive.Track
          className={cn(
            "relative w-full grow overflow-hidden rounded-full transition-all duration-200",
            sizeClasses[size],
            currentVariant.track
          )}
        >
          <SliderPrimitive.Range
            className={cn(
              "absolute h-full rounded-full transition-all duration-200",
              currentVariant.range
            )}
          />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          className={cn(
            "block rounded-full border-2 bg-white shadow-lg ring-offset-background transition-all duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:pointer-events-none disabled:opacity-50",
            "hover:shadow-xl",
            "active:shadow-md",
            thumbSizeClasses[size],
            currentVariant.thumb
          )}
        />
      </SliderPrimitive.Root>
    );
  }
);
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
