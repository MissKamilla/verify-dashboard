import { FormInputField } from "@/shared/ui/FormInputField";
import type { LoginFormValues, LoginFormErrors } from "@/features/auth/types";
import { validateLoginForm } from "@/features/auth/validateLoginForm";
import { useState, type ChangeEvent, type SyntheticEvent } from "react";

const initialFormValues: LoginFormValues = {
  email: "",
  password: "",
};

export function LoginPage() {
  const [formValues, setFormValues] =
    useState<LoginFormValues>(initialFormValues);
  const [errors, setErrors] = useState<LoginFormErrors>({});

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.currentTarget;

    setFormValues((prev) => ({
      ...prev,
      [name as keyof LoginFormValues]: value,
    }));
  };

  const handleSubmit = (
    event: SyntheticEvent<HTMLFormElement, SubmitEvent>,
  ) => {
    event.preventDefault();
    const validationErrors = validateLoginForm(formValues);

    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    console.log(formValues);
  };

  return (
    <main>
      <form onSubmit={handleSubmit} noValidate>
        <FormInputField
          label="Email"
          type="email"
          name="email"
          value={formValues.email}
          onChange={handleChange}
          error={errors.email}
          autoComplete="email"
        />

        <FormInputField
          label="Password"
          type="password"
          name="password"
          value={formValues.password}
          onChange={handleChange}
          error={errors.password}
          autoComplete="current-password"
        />

        <button type="submit">Login</button>
      </form>
    </main>
  );
}
