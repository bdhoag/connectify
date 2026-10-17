"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { useRegister } from "@/features/auth/api/use-auth"
import { FormAlert } from "@/features/auth/components/form-alert"
import { FormField } from "@/features/auth/components/form-field"
import { PasswordField } from "@/features/auth/components/password-field"
import { SubmitButton } from "@/features/auth/components/submit-button"
import { useNextPath } from "@/features/auth/hooks/use-next-path"
import {
  issuesByField,
  registerSchema,
  type RegisterInput,
} from "@/features/auth/schemas/auth"
import { ApiError, fieldErrorsFrom } from "@/lib/api-client"

const FIELDS = ["username", "email", "password"] as const
type FieldErrors = Partial<Record<keyof RegisterInput, string>>

function registerErrorMessage(error: unknown) {
  if (!(error instanceof ApiError))
    return "Something went wrong. Please try again."
  // CONFLICT carries a readable message naming the taken email or username.
  return error.message
}

export function RegisterForm() {
  const router = useRouter()
  const nextPath = useNextPath()
  const registerMutation = useRegister()
  const [values, setValues] = useState<RegisterInput>({
    username: "",
    email: "",
    password: "",
  })
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const serverFieldErrors = fieldErrorsFrom(registerMutation.error, FIELDS)
  const showFormError =
    registerMutation.isError && Object.keys(serverFieldErrors).length === 0
  const pending = registerMutation.isPending || registerMutation.isSuccess

  function update(field: keyof RegisterInput, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
    setFieldErrors((current) => ({ ...current, [field]: undefined }))
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsed = registerSchema.safeParse(values)
    if (!parsed.success) {
      setFieldErrors(issuesByField(parsed.error))
      return
    }
    registerMutation.mutate(parsed.data, {
      onSuccess: () => {
        router.replace(nextPath)
        router.refresh()
      },
    })
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
      {showFormError && (
        <FormAlert message={registerErrorMessage(registerMutation.error)} />
      )}
      <FormField
        id="username"
        label="Username"
        autoComplete="username"
        autoCapitalize="none"
        spellCheck={false}
        value={values.username}
        onChange={(e) => update("username", e.target.value)}
        error={fieldErrors.username ?? serverFieldErrors.username}
        hint="3–30 characters: letters, numbers and underscores."
      />
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
        autoComplete="new-password"
        value={values.password}
        onChange={(e) => update("password", e.target.value)}
        error={fieldErrors.password ?? serverFieldErrors.password}
        hint="At least 8 characters, with a letter and a number."
      />
      <SubmitButton
        pending={pending}
        disabled={!values.username || !values.email || !values.password}
      >
        {pending ? "Creating account…" : "Create account"}
      </SubmitButton>
      <p className="text-center text-small text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-brand-ink underline-offset-4 hover:underline"
        >
          Log in
        </Link>
      </p>
    </form>
  )
}
