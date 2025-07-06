// Functions
import { auth, isAuthorized } from "@/lib/auth"
import { createLinkToken, exchangePublicTokenForAccessToken, syncTransactions } from "@/functions/plaid"
import { redirect, unauthorized } from "next/navigation"

// Components
import { SignOut } from "@/components/SignOut"
import { PlaidLink } from "@/components/PlaidLink"
import { getUserByEmail } from "@/functions/db/queries"
import { CreateUserInput } from "@/functions/db/types"
import { createUser } from "@/functions/db/mutations"
import { Transaction } from "@/generated/prisma"
import { Decimal } from "@prisma/client/runtime/library"
import { Transactions } from "@/components/Transactions"

export default async function Plaid() {
  const session = await auth()
  if (!session) redirect("/")
  const authorized = isAuthorized(session)
  if (!authorized) unauthorized()

  // TODO: verification function for having a full user object
  console.log(`Creating link token for user ${session!.user!.id!} (${session!.user!.email!})`)
  const linkTokenResponse = await createLinkToken(session!.user!.id!)
  console.log("linkToken response data:", linkTokenResponse)

  // If the user doesn't have an email in the session, return an error
  if (!session?.user?.email) {
    return <p>Error: User email not found in session.</p>
  }

  // Get the user by the email if they exist, otherwise create a new user
  var userResponse = await getUserByEmail(session.user.email)
  if (!userResponse) {
    const createUserInput: CreateUserInput = {
      Name: session.user.name || "Unknown User",
      Email: session.user.email,
      Image: session.user.image,
    }
    userResponse = await createUser(createUserInput)
  }

  // Get the access token for the user
  const accessToken = await exchangePublicTokenForAccessToken(linkTokenResponse.link_token)

  // Sync the transactions
  const transactionSyncResponse = await syncTransactions(accessToken)
  const transactions: Transaction[] = []
  for (const transaction of transactionSyncResponse) {
    transactions.push({
      id: transaction.transaction_id,
      transactionId: transaction.transaction_id,
      accountId: transaction.account_id,
      currencyCode: transaction.iso_currency_code,
      amount: Decimal(transaction.amount),
      date: new Date(transaction.date),
      name: transaction.name,
      pending: transaction.pending,
    } as Transaction)
  }

  // TODO: After the user connects their accounts, add a new option for "add a new account"
  return (
    <>
      <p>User: {session.user.email}</p>
      <p>Link token: {linkTokenResponse.link_token}</p>
      {userResponse.Accounts.length != 0 ? (
        <PlaidLink userId={userResponse.User.id} linkToken={linkTokenResponse.link_token} />
      ) : (
        <Transactions transactions={transactions}
        />
      )}
      <SignOut />
    </>
  )
}
