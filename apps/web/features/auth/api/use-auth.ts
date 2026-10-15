"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"

import { login, logout, register } from "@/features/auth/api/auth"
import { authKeys, meQueryOptions } from "@/features/auth/api/keys"
import type { LoginInput, RegisterInput } from "@/features/auth/schemas/auth"

export function useMe() {
  return useQuery(meQueryOptions())
}

export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: login,
    meta: { skipAuthRedirect: true },
    onSuccess: ({ user }) => queryClient.setQueryData(authKeys.me(), user),
  })
}

// The API doesn't start a session on register, so sign in right after.
export function useRegister() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: RegisterInput) => {
      await register(input)
      const credentials: LoginInput = {
        email: input.email,
        password: input.password,
      }
      return login(credentials)
    },
    meta: { skipAuthRedirect: true },
    onSuccess: ({ user }) => queryClient.setQueryData(authKeys.me(), user),
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  const router = useRouter()
  return useMutation({
    mutationFn: logout,
    meta: { skipAuthRedirect: true },
    // Leave even if the request failed: the user asked to be signed out.
    onSettled: () => {
      queryClient.clear()
      router.replace("/login")
      router.refresh()
    },
  })
}
