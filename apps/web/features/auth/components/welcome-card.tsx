"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

import { useMe } from "@/features/auth/api/use-auth"

export function WelcomeCard() {
  const { data: user } = useMe()
  if (!user) return null
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-heading">
          Welcome, {user.displayName || user.username}
        </CardTitle>
        <CardDescription className="text-small">
          You&apos;re signed in as {user.email}. Your feed will show up here
          soon.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-small text-muted-foreground">
        Member since{" "}
        <time dateTime={user.createdAt}>
          {new Date(user.createdAt).toLocaleDateString(undefined, {
            month: "long",
            year: "numeric",
          })}
        </time>
      </CardContent>
    </Card>
  )
}
