// Functions
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { createLinkToken } from "@/functions/plaid"

// Components
import { SignOut } from "@/components/SignOut"
import { PlaidLink } from "@/components/PlaidLink"

export default async function Plaid() {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  if (!session) {
    redirect("/")
  }

  console.log(`Creating link token for user ${session.user.id}`)
  const linkTokenResponse = await createLinkToken(session.user.id)
  console.log("linkToken response data:", linkTokenResponse)

  return (
    <>
      <p>User: {session.user.email}</p>
      <p>Link token: {linkTokenResponse.link_token}</p>
      <PlaidLink linkToken={linkTokenResponse.link_token} />
      <SignOut />
    </>
  )
}
