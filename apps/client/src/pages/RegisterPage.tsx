import type {
  RegisterFormErrors,
  RegisterFormValues,
} from "@/features/auth/types";
import { validateRegisterForm } from "@/features/auth/validateRegisterForm";
import { FormInputField } from "@/shared/ui/FormInputField";
import { useState, type ChangeEvent, type SyntheticEvent } from "react";

const initialFormValues: RegisterFormValues = {
  firstname: "",
  lastname: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export function RegisterPage() {
  const [formValues, setFormValues] =
    useState<RegisterFormValues>(initialFormValues);

  const [errors, setErrors] = useState<RegisterFormErrors>({});

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.currentTarget;

    setFormValues((prev) => ({
      ...prev,
      [name as keyof RegisterFormValues]: value,
    }));
  };

  const handleSubmit = (
    event: SyntheticEvent<HTMLFormElement, SubmitEvent>,
  ) => {
    event.preventDefault();
    const validationErrors = validateRegisterForm(formValues);

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }
    console.log(formValues);
  };

  return (
    <main>
      <h1>Register</h1>

      <form onSubmit={handleSubmit} noValidate>
        <FormInputField
          label="First Name"
          type="text"
          name="firstname"
          value={formValues.firstname}
          onChange={handleChange}
          error={errors.firstname}
          autoComplete="given-name"
        />

        <FormInputField
          label="Last Name"
          type="text"
          name="lastname"
          value={formValues.lastname}
          onChange={handleChange}
          error={errors.lastname}
          autoComplete="family-name"
        />

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
          autoComplete="new-password"
        />

        <FormInputField
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          value={formValues.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          autoComplete="new-password"
        />

        <button type="submit">Create account</button>
      </form>
    </main>
  );
}
