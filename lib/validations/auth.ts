import * as z from 'zod'

export const loginSchema = z.object({
  email: z.string()
    .trim()
    .min(5, "Email is too short.")
    .max(254, "Email is too long.")
    .email("Please enter a valid email address."),
  password: z.string()
    .min(1, "Password is required.")
    .max(128, "Password is too long."),
})

export const registerSchema = z.object({
  username: z.string()
    .min(3, "Username must be at least 3 characters.")
    .max(30, "Username cannot exceed 30 characters.")
    .regex(/^[a-zA-Z0-9_ -]+$/, "Username can only contain letters, numbers, spaces, underscores, and hyphens."),
  email: z.string()
    .trim()
    .min(5, "Email is too short.")
    .max(254, "Email is too long.")
    .email("Please enter a valid email address."),
  password: z.string()
    .min(8, "Password must be at least 8 characters.")
    .max(128, "Password is too long.")
    .regex(/(?=.*[a-z])/, "Password must contain at least one lowercase letter.")
    .regex(/(?=.*[A-Z])/, "Password must contain at least one uppercase letter.")
    .regex(/(?=.*\d)/, "Password must contain at least one number.")
    .regex(/(?=.*[@$!%*?&])/, "Password must contain at least one special character.")
    .refine((s) => !s.startsWith(' ') && !s.endsWith(' '), "Password cannot start or end with spaces."),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"], // path of error
})

export type LoginFormValues = z.infer<typeof loginSchema>
export type RegisterFormValues = z.infer<typeof registerSchema>
