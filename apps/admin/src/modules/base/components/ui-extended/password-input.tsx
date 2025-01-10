import {
  FloatingLabelInput,
  type FloatingLabelInputProps,
} from "@/modules/base/components/ui-extended/floating-label-input";
import { LucideEye, LucideEyeOff } from "lucide-react";
import * as React from "react";

const PasswordInput = React.forwardRef<
  HTMLInputElement,
  React.PropsWithRef<FloatingLabelInputProps> & {
    containerClassName?: string;
    label?: string;
  }
>(({ className, containerClassName, type: _type, ...props }, ref) => {
  const [passwordVisibility, setPasswordVisibility] = React.useState(false);

  return (
    <div className={`relative ${containerClassName}`}>
      <FloatingLabelInput
        type={passwordVisibility ? "text" : "password"}
        className={className}
        ref={ref}
        {...props}
      />
      <div
        className="absolute inset-y-0 right-0 flex cursor-pointer items-center p-3 text-muted-foreground"
        onClick={() => setPasswordVisibility(!passwordVisibility)}
      >
        {React.createElement(passwordVisibility ? LucideEyeOff : LucideEye, {
          className: "h-6 w-6",
        })}
      </div>
    </div>
  );
});
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
