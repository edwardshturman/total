"use server"

import {
  exchangePublicTokenForAccessToken,
  getAccountInfo,
} from "@/functions/plaid"
import { createItem, type CreateItemInput } from "@/functions/db/items"
import { createAccount, type CreateAccountInput } from "@/functions/db/accounts"

export async function exchangePublicTokenForAccessTokenServerAction(
  userId: string,
  publicToken: string
) {

  // Fetch the access token using the public token
  const accessToken = await exchangePublicTokenForAccessToken(publicToken)
  if (!accessToken) {
    console.error("Failed to exchange public token for access token")
    return
  }

  // Get all the account info
  const accountInfo = await getAccountInfo(accessToken)

  // Create a new Item in the database
  const createItemInput: CreateItemInput = {
    id: accountInfo.item.item_id,
    userId: userId,
    accessToken: accessToken,
    institutionName: accountInfo.item.institution_name || ""
  }
  const newItem = await createItem(createItemInput)
  console.log("Created new item: ", newItem)

  // Now create accounts for the items
  for (const account of accountInfo.accounts) {
    const newAccountInput: CreateAccountInput = {
      id: account.account_id,
      itemId: newItem.id,
      name: account.name,
      mask: account.mask || "",
      userId: userId
    }

    const resp = await createAccount(newAccountInput)
    console.log("Created account:", resp)
  }
}
