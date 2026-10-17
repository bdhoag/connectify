import { Loader2Icon } from "lucide-react"

import { Button } from "@workspace/ui/components/button"

type SubmitButtonProps = {
  pending: boolean
  disabled?: boolean
  children: React.ReactNode
}

export function SubmitButton({
  pending,
  disabled,
  children,
}: SubmitButtonProps) {
  return (
    <Button
      type="submit"
      size="lg"
      className="w-full"
      disabled={pending || disabled}
    >
      {pending && <Loader2Icon className="animate-spin" aria-hidden />}
      {children}
    </Button>
  )
}
