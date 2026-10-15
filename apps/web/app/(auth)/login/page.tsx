import type { Metadata } from "next"
import { Suspense } from "react"

import { redirectIfSignedIn } from "@/features/auth/api/auth.server"
import { LoginForm } from "@/features/auth/components/login-form"

export const metadata: Metadata = { title: "Log in" }

export default async function LoginPage() {
  await redirectIfSignedIn()

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-display">Welcome back</h1>
        <p className="text-body text-muted-foreground">
          Log in to catch up with your people.
        </p>
      </div>
      {/* LoginForm reads ?next= from the URL. */}
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  )
}
