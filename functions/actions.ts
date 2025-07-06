"use server"

import {
  exchangePublicTokenForAccessToken,
  getAccountInfo,
  getTransactions
} from "@/functions/plaid"
import { createAccount } from "./db/mutations"
import { CreateAccountInput } from "./db/types"

export async function exchangePublicTokenForAccessTokenServerAction(
  userId: string,
  publicToken: string
) {
  const accessToken = await exchangePublicTokenForAccessToken(publicToken)
  const accountData = await getAccountInfo(accessToken)
  const transactionsData = await getTransactions(accessToken)
  console.log(accountData)
  console.log(transactionsData)

  // Create an new account for each account in the transactions data
  for (const account of transactionsData.accounts) {
    const newAccountInput: CreateAccountInput = {
      ID: account.account_id,
      Name: account.name,
      OfficialName: account.official_name || "",
      Mask: account.mask || "",
      UserID: userId,
    }

    const resp = await createAccount(newAccountInput)
    console.log("Created account:", resp)
  }
  return accountData
}
