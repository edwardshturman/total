"use client"

import { signIn } from "next-auth/react"

async function handleLoginWithGoogle() {
  return await signIn("google", { callbackUrl: "/plaid" })
}

export function SignIn() {
  return <button onClick={handleLoginWithGoogle}>Login with Google</button>
}
