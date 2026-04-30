import React from "react";
import { buttonVariants } from "./buttonVariants";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariants.variants;
  size?: keyof typeof buttonVariants.sizes;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "default", size = "md", style, ...props }, ref) => {
    const combinedStyle = {
      ...buttonVariants.base,
      ...buttonVariants.variants[variant],
      ...buttonVariants.sizes[size],
      ...style
    };

    return (
      <button
        ref={ref}
        style={combinedStyle as React.CSSProperties}
        onMouseEnter={(e) => {
          if (variant === 'default') e.currentTarget.style.filter = "brightness(1.1)";
          if (variant === 'outline') e.currentTarget.style.backgroundColor = "#f8fafc";
        }}
        onMouseLeave={(e) => {
          if (variant === 'default') e.currentTarget.style.filter = "none";
          if (variant === 'outline') e.currentTarget.style.backgroundColor = "white";
        }}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
