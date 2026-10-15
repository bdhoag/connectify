import { cn } from "@workspace/ui/lib/utils"

// Separate light/dark artwork; the `.dark` class on <html> picks one.
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element -- static SVG, no optimisation needed */}
      <img
        src="/brand/connectify-wordmark.svg"
        alt="Connectify"
        width={132}
        height={32}
        className="h-8 w-auto dark:hidden"
      />
      {/* eslint-disable-next-line @next/next/no-img-element -- static SVG, no optimisation needed */}
      <img
        src="/brand/connectify-wordmark-dark.svg"
        alt="Connectify"
        width={132}
        height={32}
        className="hidden h-8 w-auto dark:block"
      />
    </span>
  )
}
