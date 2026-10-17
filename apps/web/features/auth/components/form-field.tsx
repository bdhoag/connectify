import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"

type FormFieldProps = React.ComponentProps<typeof Input> & {
  id: string
  label: string
  error?: string
  hint?: string
  trailing?: React.ReactNode
}

export function FormField({
  id,
  label,
  error,
  hint,
  trailing,
  ...inputProps
}: FormFieldProps) {
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  const describedBy =
    [error && errorId, hint && hintId].filter(Boolean).join(" ") || undefined

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={trailing ? "pr-11" : undefined}
          {...inputProps}
        />
        {trailing && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-1">
            {trailing}
          </div>
        )}
      </div>
      {hint && !error && (
        <p id={hintId} className="text-caption text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-caption text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
