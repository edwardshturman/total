// Functions
import { auth, isAuthorized } from "@/lib/auth"
import { createLinkToken } from "@/functions/plaid"
import { redirect, unauthorized } from "next/navigation"

// Components
import { SignOut } from "@/components/SignOut"
import { PlaidLink } from "@/components/PlaidLink"

export default async function Plaid() {
  const session = await auth()
  if (!session) redirect("/")
  const authorized = isAuthorized(session)
  if (!authorized) unauthorized()

  // TODO: verification function for having a full user object
  console.log(`Creating link token for user ${session!.user!.id!} (${session!.user!.email!})`)
  const linkTokenResponse = await createLinkToken(session!.user!.id!)
  console.log("linkToken response data:", linkTokenResponse)

  return (
    <>
      <p>User: {session!.user!.email!}</p>
      <p>Link token: {linkTokenResponse.link_token}</p>
      <PlaidLink linkToken={linkTokenResponse.link_token} />
      <SignOut />
    </>
  )
}
