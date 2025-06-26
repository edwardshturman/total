import { auth } from "@/lib/auth"
import { headers } from "next/headers"

import { PlaidLink } from "@/components/PlaidLink"

import { createLinkToken } from "@/functions/plaid"

export default async function Plaid() {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  const linkTokenResponse = await createLinkToken("edward")
  console.log("linkToken response data:", linkTokenResponse)

  return (
    <>
      <h1>Plaid</h1>
      <p>User:</p>
      <p>{session && session.user.email}</p>
      <p>Link token: {linkTokenResponse.link_token}</p>
      <PlaidLink linkToken={linkTokenResponse.link_token} />
    </>
  )
}
