import type { Metadata } from "next"
import { Suspense } from "react"

import { redirectIfSignedIn } from "@/features/auth/api/auth.server"
import { RegisterForm } from "@/features/auth/components/register-form"

export const metadata: Metadata = { title: "Create account" }

export default async function RegisterPage() {
  await redirectIfSignedIn()

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-display">Create your account</h1>
        <p className="text-body text-muted-foreground">
          Join Connectify and start following people you care about.
        </p>
      </div>
      <Suspense>
        <RegisterForm />
      </Suspense>
    </div>
  )
}
