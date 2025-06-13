import { PlaidLink } from "@/components/PlaidLink"
import { createLinkToken } from "@/functions/plaid"

export default async function Plaid() {
  const linkTokenResponse = await createLinkToken("edward")
  console.log("linkToken response data:", linkTokenResponse)

  return (
    <>
      <h1>Plaid</h1>
      <p>Link token: {linkTokenResponse.link_token}</p>
      <PlaidLink linkToken={linkTokenResponse.link_token} />
    </>
  )
}
