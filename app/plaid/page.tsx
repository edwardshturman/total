// Functions
import { auth, isAuthorized } from "@/lib/auth"
import { getItems } from "@/functions/db/items"
import { redirect, unauthorized } from "next/navigation"
import { getAccountsByItemId } from "@/functions/db/accounts"
import { decryptAccessToken } from "@/functions/crypto/utils"
import { createUser, getUserByEmail } from "@/functions/db/users"
import {
  createLinkToken,
  getAccounts,
  syncTransactions
} from "@/functions/plaid"
import {
  convertTransactionForClient,
  getTransactions
} from "@/functions/db/transactions"

// Components
import { SignOut } from "@/components/SignOut"
import { PlaidLink } from "@/components/PlaidLink"
import { Transactions } from "@/components/Transactions"

// Types
import type { Account, Transaction } from "@/generated/prisma"

export default async function Plaid() {
  const session = await auth()
  if (!session) redirect("/")
  const authorized = isAuthorized(session)
  if (!authorized) unauthorized()

  const linkTokenResponse = await createLinkToken(session!.user!.id!)

  // TODO: verification function for having a full user object
  let user = await getUserByEmail(session!.user!.email!)
  if (!user) {
    user = await createUser({
      name: session!.user!.name!,
      email: session!.user!.email!
    })
  }

  const accounts: Account[] = []
  const transactions: Transaction[] = []
  const userItems = await getItems(user.id)
  const encryptionKey = process.env.KEY_IN_USE!
  const keyVersion = process.env.KEY_VERSION!
  for (const item of userItems) {
    const encryptedAccessToken = item.accessToken
    const { plainText: accessToken } = decryptAccessToken(
      encryptedAccessToken,
      encryptionKey,
      keyVersion
    )

    // Sync transactions from Plaid → db, across all accounts for the given Item
    await syncTransactions(accessToken)

    // Add accounts for the given Item to user's available accounts for filtering
    const itemAccounts = await getAccountsByItemId(item.id)
    accounts.push(...itemAccounts)

    // Aggregate transactions across Item accounts for rendering
    const { accounts: accountsFromItem } = await getAccounts(accessToken)
    for (const account of accountsFromItem) {
      const accountTransactions = await getTransactions(account.account_id)
      transactions.push(...accountTransactions)
    }
  }
  const clientFriendlyTransactions = transactions.map(
    convertTransactionForClient
  )

  // TODO: After the user connects their accounts, add a new option for "add a new account"
  return (
    <>
      <p>User: {session!.user!.email!}</p>
      <p>Link token: {linkTokenResponse.link_token}</p>
      {userItems.length === 0 ? (
        <PlaidLink linkToken={linkTokenResponse.link_token} userId={user.id} />
      ) : (
        <Transactions
          initialTransactions={clientFriendlyTransactions}
          accounts={accounts}
        />
      )}
      <SignOut />
    </>
  )
}
