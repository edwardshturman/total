"use server"

import {
  exchangePublicTokenForAccessToken,
  getAccountInfo
} from "@/functions/plaid"

export async function exchangePublicTokenForAccessTokenServerAction(
  publicToken: string
) {
  const accessToken = await exchangePublicTokenForAccessToken(publicToken)
  const accountData = await getAccountInfo(accessToken)
  console.log(accountData)
  return accountData
}
