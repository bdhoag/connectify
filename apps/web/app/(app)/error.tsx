"use client"

import { TriangleAlertIcon } from "lucide-react"

import { Button } from "@workspace/ui/components/button"

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 py-16 text-center"
    >
      <div className="flex size-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
        <TriangleAlertIcon className="size-5" aria-hidden />
      </div>
      <h2 className="text-heading">Couldn&apos;t load this page</h2>
      <p className="text-small text-muted-foreground">
        Something went wrong on our side. Try again in a moment.
      </p>
      <Button variant="outline" onClick={reset}>
        Try again
      </Button>
    </div>
  )
}
