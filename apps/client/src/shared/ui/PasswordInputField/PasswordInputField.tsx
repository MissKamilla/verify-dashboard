import { useState, type ComponentProps } from "react";

import eyeIcon from "@/assets/icons/eye.svg";
import eyeOffIcon from "@/assets/icons/eye-off.svg";
import { FormInputField } from "@/shared/ui/FormInputField";

type PasswordInputFieldProps = Omit<
  ComponentProps<typeof FormInputField>,
  "type" | "endIcon"
>;

export function PasswordInputField(props: PasswordInputFieldProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <FormInputField
      {...props}
      type={isPasswordVisible ? "text" : "password"}
      endIcon={
        <button
          type="button"
          aria-label={isPasswordVisible ? "Hide password" : "Show password"}
          aria-pressed={isPasswordVisible}
          onClick={() => setIsPasswordVisible((prev) => !prev)}
          className="flex h-6 w-6 items-center justify-center"
        >
          <img
            src={isPasswordVisible ? eyeOffIcon : eyeIcon}
            alt=""
            className="h-6 w-6"
          />
        </button>
      }
    />
  );
}
