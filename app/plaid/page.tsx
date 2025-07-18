// Functions
import { auth, isAuthorized } from "@/lib/auth"
import { getItems } from "@/functions/db/items"
import { redirect, unauthorized } from "next/navigation"
import { getAccountsByItemId } from "@/functions/db/accounts"
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

  // Sync transactions from all of the user's accounts
  const userItems = await getItems(user.id)
  const accounts: Account[] = []
  for (const item of userItems) {
    const accessToken = item.accessToken
    await syncTransactions(accessToken)
    const itemAccounts = await getAccountsByItemId(item.id)
    accounts.push(...itemAccounts)
  }

  // Aggregate transactions across all of the user's accounts
  const transactions: Transaction[] = []
  for (const item of userItems) {
    const { accounts } = await getAccounts(item.accessToken)
    for (const account of accounts) {
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
