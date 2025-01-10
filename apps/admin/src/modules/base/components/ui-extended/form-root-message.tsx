import type { VariantProps } from "class-variance-authority";
import React from "react";
import { cva } from "class-variance-authority";

import { cn } from "@repo/ui/lib/utils";

const formRootMessageVariants = cva(
  "flex items-center rounded p-2 text-left text-sm font-medium",
  {
    variants: {
      variant: {
        default: "bg-destructive/10 text-destructive",
        destructive: "bg-destructive/10 text-destructive",
        success: "bg-success/10 text-success",
        warning: "bg-warning/10 text-warning",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface FormRootMessageProps
  extends React.ButtonHTMLAttributes<HTMLDivElement>,
    VariantProps<typeof formRootMessageVariants> {
  message?: null | string;
  messageClassName?: string;
  icon?: React.ReactNode;
}

const FormRootMessage = React.forwardRef<HTMLDivElement, FormRootMessageProps>(
  ({ className, variant, ...props }, ref) => {
    if (!props.message) {
      return null;
    }

    return (
      <div
        className={cn(formRootMessageVariants({ variant, className }))}
        ref={ref}
        {...props}
      >
        {props.icon}
        {/* <p className="ml-2">{props.message}</p> */}
        <p
          className={cn(
            {
              "ml-2": props.icon,
            },
            props.messageClassName,
          )}
        >
          {props.message}
        </p>
      </div>
    );
  },
);
FormRootMessage.displayName = "FormRootMessage";

export { FormRootMessage, formRootMessageVariants };
