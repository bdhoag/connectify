import { z } from "zod"

// Mirrors `UserEntity` in apps/api (dates arrive as ISO strings).
export type User = {
  id: string
  username: string
  email: string
  status: "ACTIVE" | "SUSPENDED" | "DELETED"
  displayName: string
  bio: string | null
  avatarUrl: string | null
  createdAt: string
  updatedAt: string
}

// Mirrors LoginDto.
export const loginSchema = z.object({
  email: z.email({ error: "Enter a valid email address." }),
  password: z.string().min(1, { error: "Enter your password." }),
})
export type LoginInput = z.infer<typeof loginSchema>

// Mirrors RegisterDto.
export const registerSchema = z.object({
  username: z
    .string()
    .min(3, { error: "Use at least 3 characters." })
    .max(30, { error: "Use 30 characters or fewer." })
    .regex(/^[a-zA-Z0-9_]+$/, {
      error: "Use only letters, numbers and underscores.",
    }),
  email: z.email({ error: "Enter a valid email address." }),
  password: z
    .string()
    .min(8, { error: "Use at least 8 characters." })
    .max(100, { error: "Use 100 characters or fewer." })
    .regex(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
      error: "Include at least one letter and one number.",
    }),
})
export type RegisterInput = z.infer<typeof registerSchema>

// First zod message per top-level field, for showing under each input.
export function issuesByField<T>(
  error: z.ZodError<T>
): Partial<Record<keyof T, string>> {
  const result: Partial<Record<keyof T, string>> = {}
  for (const issue of error.issues) {
    const field = issue.path[0] as keyof T
    result[field] ??= issue.message
  }
  return result
}
