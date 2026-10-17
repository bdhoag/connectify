"use client"

import { useState } from "react"
import { EyeIcon, EyeOffIcon } from "lucide-react"

import { Button } from "@workspace/ui/components/button"

import { FormField } from "@/features/auth/components/form-field"

type PasswordFieldProps = Omit<
  React.ComponentProps<typeof FormField>,
  "type" | "trailing"
>

export function PasswordField(props: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)
  return (
    <FormField
      {...props}
      type={visible ? "text" : "password"}
      trailing={
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </Button>
      }
    />
  )
}
