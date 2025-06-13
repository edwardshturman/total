"use client"

import { type PlaidLinkOptions, usePlaidLink } from "react-plaid-link"
import { exchangePublicTokenForAccessTokenServerAction } from "@/functions/actions"

export function PlaidLink({ linkToken }: { linkToken: string }) {
  async function onSuccess(public_token: string) {
    console.log("public_token", public_token)
    await exchangePublicTokenForAccessTokenServerAction(public_token)
  }

  const config: PlaidLinkOptions = {
    token: linkToken,
    onSuccess
  }

  const { open, ready } = usePlaidLink(config)

  return (
    <button onClick={() => open()} disabled={!ready}>
      Connect a bank account
    </button>
  )
}
