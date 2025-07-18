"use client"

import { signOut } from "next-auth/react"

export function SignOut() {
  return <button onClick={async () => await signOut()}>Sign out</button>
}
