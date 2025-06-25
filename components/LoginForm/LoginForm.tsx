"use client"

import Image from "next/image"

import { authClient } from "@/lib/auth-client"

async function handleLoginWithGoogle() {
  await authClient.signIn.social({
    provider: "google",
    callbackURL: "/plaid"
  })
  console.log("google")
}

export function LoginForm() {
  return (
    <div className="login-container">
      <h2>Login</h2>
      <button
        className="google-button"
        onClick={handleLoginWithGoogle}
      >
        <Image
          src="https://developers.google.com/identity/images/g-logo.png"
          alt="Google logo"
        />
        Login with Google
      </button>
    </div>
  )
}
