"use server"

import {
  exchangePublicTokenForAccessToken,
  getAccountInfo,
  getItem,
  syncTransactions,
} from "@/functions/plaid"
import { createAccount, createItem } from "./db/mutations"
import { CreateAccountInput, CreateItemInput } from "./db/types"
import { ItemGetRequest } from "plaid"

export async function exchangePublicTokenForAccessTokenServerAction(
  userId: string,
  publicToken: string
) {

  // Fetch the access token using the public token
  const accessToken = await exchangePublicTokenForAccessToken(publicToken)

  // Get all the account info
  const accountInfo = await getAccountInfo(accessToken)

  // Create a new item in the database
  const createItemInput: CreateItemInput = {
    ID: accountInfo.item.item_id,
    UserID: userId,
    AccessToken: accessToken,
    InstitutionName: accountInfo.item.institution_name || "",
  }
  const newItem = await createItem(createItemInput)
  console.log("Created new item: ", newItem)

  // Now create accounts for the items
  for (const account of accountInfo.accounts) {
    const newAccountInput: CreateAccountInput = {
      ID: account.account_id,
      ItemID: newItem.id,
      Name: account.name,
      OfficialName: account.official_name || "",
      Mask: account.mask || undefined,
      UserID: userId,
    }

    const resp = await createAccount(newAccountInput)
    console.log("Created account:", resp)
  }
}
