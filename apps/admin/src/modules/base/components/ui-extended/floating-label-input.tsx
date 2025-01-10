"use client";

import * as React from "react";

import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { cn } from "@repo/ui/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const FloatingInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <Input
        placeholder=" "
        className={cn(className, "peer pt-4")}
        ref={ref}
        {...props}
      />
    );
  },
);
FloatingInput.displayName = "FloatingInput";

const FloatingLabel = React.forwardRef<
  React.ElementRef<typeof Label>,
  React.ComponentPropsWithoutRef<typeof Label>
>(({ className, children, ...props }, ref) => {
  return (
    <Label
      className={cn(
        "absolute start-2 top-2 z-10 origin-[0] -translate-y-4 scale-[0.85] transform bg-background px-2 text-primary duration-300 dark:bg-background rtl:peer-focus:left-auto rtl:peer-focus:translate-x-1/4",
        "peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-[0.85] peer-focus:px-2 peer-focus:text-primary",
        "peer-autofill:top-2 peer-autofill:-translate-y-4 peer-autofill:scale-[0.85] peer-autofill:px-2 peer-autofill:text-primary",
        "peer-data-[state=open]:top-2 peer-data-[state=open]:-translate-y-4 peer-data-[state=open]:scale-[0.85] peer-data-[state=open]:px-2 peer-data-[state=open]:text-primary",
        "peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-foreground/50",
        "peer-data-[placeholder]:top-1/2 peer-data-[placeholder]:-translate-y-1/2 peer-data-[placeholder]:scale-100 peer-data-[placeholder]:text-foreground/50",
        "peer-disabled:top-1/2 peer-disabled:flex peer-disabled:h-1/2 peer-disabled:w-11/12 peer-disabled:-translate-y-1/2 peer-disabled:scale-100 peer-disabled:items-center peer-disabled:px-2 peer-disabled:text-foreground/50 peer-disabled:opacity-100",
        "pointer-events-none whitespace-nowrap",
        "peer-required:after:text-destructive peer-required:after:content-['_*']",
        "peer-aria-required:after:text-destructive peer-aria-required:after:content-['_*']",
        className,
      )}
      ref={ref}
      {...props}
    >
      &gt; {children}
    </Label>
  );
});
FloatingLabel.displayName = "FloatingLabel";

export type FloatingLabelInputProps = InputProps;

const FloatingLabelInput = React.forwardRef<
  React.ElementRef<typeof FloatingInput>,
  React.PropsWithoutRef<FloatingLabelInputProps> & {
    containerClassName?: string;
    label?: string;
  }
>(({ id, containerClassName, label, ...props }, ref) => {
  return (
    <div className={cn("relative flex-grow", containerClassName)}>
      <FloatingInput ref={ref} id={id} {...props} />
      <FloatingLabel htmlFor={id}>{label}</FloatingLabel>
    </div>
  );
});
FloatingLabelInput.displayName = "FloatingLabelInput";

export { FloatingInput, FloatingLabel, FloatingLabelInput };
