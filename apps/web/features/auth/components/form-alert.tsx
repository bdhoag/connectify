import { CircleAlertIcon } from "lucide-react"

export function FormAlert({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-small text-destructive"
    >
      <CircleAlertIcon className="mt-px size-4 shrink-0" aria-hidden />
      <p>{message}</p>
    </div>
  )
}
