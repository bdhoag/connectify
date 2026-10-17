import { apiRequest } from "@/lib/api-client"
import type {
  LoginInput,
  RegisterInput,
  User,
} from "@/features/auth/schemas/auth"

// The API also returns the access token in the body; the web app ignores it
// and relies on the httpOnly cookies set alongside it.
type LoginResponse = { user: User }

export function login(input: LoginInput) {
  return apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: input,
  })
}

export function register(input: RegisterInput) {
  return apiRequest<User>("/auth/register", { method: "POST", body: input })
}

export function logout() {
  return apiRequest<void>("/auth/logout", { method: "POST" })
}

export function getMe() {
  return apiRequest<User>("/auth/me")
}
