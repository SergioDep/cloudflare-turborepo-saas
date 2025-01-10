import { z } from "zod";

// Minimum 8 characters
const PasswordSchema = z.string().min(6);
// At least one uppercase letter, one lowercase letter, one number and one special character
const CreatePasswordSchema = PasswordSchema.refine(
  (value) => /[A-Z]/.test(value),
  {
    message: "Password must have at least one uppercase letter.",
  },
)
  .refine((value) => /[a-z]/.test(value), {
    message: "Password must have at least one lowercase letter.",
  })
  .refine((value) => /\d/.test(value), {
    message: "Password must have at least one number.",
  })
  .refine((value) => /[\W_]/.test(value), {
    message: "Password must have at least one special character.",
  });

export const SignInCredentialsSchema = z.object({
  email: z.string().email(),
  password: PasswordSchema,
  rememberMe: z.boolean().optional(),
});

export const SignUpCredentialsSchema = z
  .object({
    email: z.string().email("Email is not valid."),
    password: CreatePasswordSchema,
    confirmPassword: z.string(),
    acceptsPolicies: z.boolean().refine((value) => value === true, {
      message: "You must accept the privacy policies.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });
