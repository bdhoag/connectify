import type { Metadata } from "next"

import { WelcomeCard } from "@/features/auth/components/welcome-card"

export const metadata: Metadata = { title: "Home" }

export default function HomePage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-title">Home</h1>
      <WelcomeCard />
    </div>
  )
}
