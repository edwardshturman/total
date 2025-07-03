"use client"

// Auth client
import { authClient } from "@/lib/auth-client"

// Functions
import { redirect } from "next/navigation"

async function signOut() {
  await authClient.signOut()
  redirect("/")
}

export function SignOut() {
  return (
    <button onClick={signOut}>
      Sign out
    </button>
  )
}
