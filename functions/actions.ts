"use server";

import {
  exchangePublicTokenForAccessToken,
  getAccounts,
} from "@/functions/plaid";
import { createItem } from "@/functions/db/items";
import { createAccount } from "@/functions/db/accounts";
import { encryptWithEnvKeys } from "./crypto/utils";

export async function exchangePublicTokenForAccessTokenServerAction(
  userId: string,
  publicToken: string,
) {
  const accessToken = await exchangePublicTokenForAccessToken(publicToken);

  // Add the Item to the database
  const { item, accounts } = await getAccounts(accessToken);

  const { cipherText: encryptedAccessToken, keyVersion: encryptionKeyVersion } =
    encryptWithEnvKeys(accessToken);

  await createItem({
    id: item.item_id,
    userId,
    accessToken: encryptedAccessToken,
    encryptionKeyVersion,
    institutionName: item.institution_name || "",
  });

  // Add each account associated with the Item to the database
  for (const account of accounts) {
    await createAccount({
      id: account.account_id,
      itemId: item.item_id,
      name: account.name,
      mask: account.mask || undefined,
    });
  }
}
