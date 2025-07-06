"use server"

import {
  exchangePublicTokenForAccessToken,
  getAccountInfo,
  getTransactions
} from "@/functions/plaid"

export async function exchangePublicTokenForAccessTokenServerAction(
  userId: string,
  publicToken: string
) {
  const accessToken = await exchangePublicTokenForAccessToken(publicToken)
  const accountData = await getAccountInfo(accessToken)
  const transactionsData = await getTransactions(accessToken)
  console.log(accountData)
  console.log(transactionsData)
  return accountData
}
