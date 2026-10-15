"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { useLogin } from "@/features/auth/api/use-auth"
import { FormAlert } from "@/features/auth/components/form-alert"
import { FormField } from "@/features/auth/components/form-field"
import { PasswordField } from "@/features/auth/components/password-field"
import { SubmitButton } from "@/features/auth/components/submit-button"
import { useNextPath } from "@/features/auth/hooks/use-next-path"
import {
  issuesByField,
  loginSchema,
  type LoginInput,
} from "@/features/auth/schemas/auth"
import { ApiError, fieldErrorsFrom } from "@/lib/api-client"

const FIELDS = ["email", "password"] as const
type FieldErrors = Partial<Record<keyof LoginInput, string>>

function loginErrorMessage(error: unknown) {
  if (!(error instanceof ApiError))
    return "Something went wrong. Please try again."
  if (error.code === "UNAUTHORIZED")
    return "That email and password don't match. Try again."
  if (error.code === "FORBIDDEN")
    return "This account isn't active. Contact support if this is unexpected."
  return error.message
}

export function LoginForm() {
  const router = useRouter()
  const nextPath = useNextPath()
  const loginMutation = useLogin()
  const [values, setValues] = useState<LoginInput>({ email: "", password: "" })
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const serverFieldErrors = fieldErrorsFrom(loginMutation.error, FIELDS)
  const showFormError =
    loginMutation.isError && Object.keys(serverFieldErrors).length === 0

  function update(field: keyof LoginInput, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
    setFieldErrors((current) => ({ ...current, [field]: undefined }))
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsed = loginSchema.safeParse(values)
    if (!parsed.success) {
      setFieldErrors(issuesByField(parsed.error))
      return
    }
    loginMutation.mutate(parsed.data, {
      onSuccess: () => {
        router.replace(nextPath)
        router.refresh()
      },
    })
  }

  // Stays pending through the redirect so the button can't be pressed twice.
  const pending = loginMutation.isPending || loginMutation.isSuccess

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
      {showFormError && (
        <FormAlert message={loginErrorMessage(loginMutation.error)} />
      )}
      <FormField
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        value={values.email}
        onChange={(e) => update("email", e.target.value)}
        error={fieldErrors.email ?? serverFieldErrors.email}
      />
      <PasswordField
        id="password"
        label="Password"
        autoComplete="current-password"
        value={values.password}
        onChange={(e) => update("password", e.target.value)}
        error={fieldErrors.password ?? serverFieldErrors.password}
      />
      <SubmitButton
        pending={pending}
        disabled={!values.email || !values.password}
      >
        {pending ? "Logging in…" : "Log in"}
      </SubmitButton>
      <p className="text-center text-small text-muted-foreground">
        New to Connectify?{" "}
        <Link
          href="/register"
          className="font-medium text-brand-ink underline-offset-4 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </form>
  )
}
