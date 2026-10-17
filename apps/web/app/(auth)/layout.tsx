import Link from "next/link"

import { Wordmark } from "@/components/shared/wordmark"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="px-4 py-5 md:px-6">
        <Link
          href="/"
          aria-label="Connectify home"
          className="inline-flex rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <Wordmark />
        </Link>
      </header>
      <main className="flex flex-1 items-start justify-center px-4 pt-8 pb-16 md:items-center md:pt-0">
        <div className="w-full max-w-[400px]">{children}</div>
      </main>
    </div>
  )
}
