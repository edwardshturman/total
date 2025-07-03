"use client"

// Auth client
import { authClient } from "@/lib/auth-client"

async function handleLoginWithGoogle() {
  return await authClient.signIn.social({
    provider: "google",
    callbackURL: "/plaid"
  })
}

export function SignIn() {
  return (
    <button onClick={handleLoginWithGoogle}>
      Login with Google
    </button>
  )
}
