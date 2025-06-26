"use client"

import { authClient } from "@/lib/auth-client"

async function handleLoginWithGoogle() {
  const data = await authClient.signIn.social({
    provider: "google",
    callbackURL: "/plaid"
  })
  console.log(data)
}

async function signOut() {
  await authClient.signOut()
}

export function LoginForm() {
  return (
    <div>
      <h2>Login</h2>
      <button onClick={handleLoginWithGoogle}>
        Login with Google
      </button>
      <button onClick={signOut}>
        Sign out
      </button>
    </div>
  )
}
