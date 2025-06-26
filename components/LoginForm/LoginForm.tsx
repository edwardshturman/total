"use client"

import { authClient } from "@/lib/auth-client"

async function handleLoginWithGoogle() {
  const data = await authClient.signIn.social({
    provider: "google",
    callbackURL: "/plaid"
  })
  console.log(data)
}

export function LoginForm() {
  return (
    <div className="login-container">
      <h2>Login</h2>
      <button
        className="google-button"
        onClick={handleLoginWithGoogle}
      >
        Login with Google
      </button>
    </div>
  )
}
