"use client"

import { LogOutIcon } from "lucide-react"

import { Button } from "@workspace/ui/components/button"

import { useLogout } from "@/features/auth/api/use-auth"

export function LogoutButton() {
  const logoutMutation = useLogout()
  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={logoutMutation.isPending}
      onClick={() => logoutMutation.mutate()}
    >
      <LogOutIcon aria-hidden />
      Log out
    </Button>
  )
}
