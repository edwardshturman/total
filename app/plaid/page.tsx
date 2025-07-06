// Functions
import { auth, isAuthorized } from "@/lib/auth"
import { createLinkToken, syncTransactions } from "@/functions/plaid"
import { redirect, unauthorized } from "next/navigation"

// Components
import { SignOut } from "@/components/SignOut"
import { PlaidLink } from "@/components/PlaidLink"
import { getUserByEmail } from "@/functions/db/queries"
import { CreateUserInput } from "@/functions/db/types"
import { createUser } from "@/functions/db/mutations"
import { Transaction } from "@/generated/prisma"
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
  let userResponse = await getUserByEmail(session.user.email)
  if (!userResponse) {
    const createUserInput: CreateUserInput = {
      Name: session.user.name || "Unknown User",
      Email: session.user.email,
      Image: session.user.image,
    }
    userResponse = await createUser(createUserInput)
  }

  console.log("userResponse: ", userResponse)

  let transactions: Transaction[] = []

  // If this user has items, then sync transactions for each item
  if (userResponse.items.length > 0) {
    // Iterate through each item
    for (const item of userResponse.items) {

      // Get the access token for the item
      const accessToken = item.accessToken

      // Iterate through each account for the item
      for (const account of item.accounts) {
        // Sync the transactions for the account
        const transactionSyncResponse = await syncTransactions(accessToken, account.id)
        console.log("transactionSyncResponse: ", transactionSyncResponse)
        transactions = transactions.concat(transactionSyncResponse)
      }
    }
  }

  // TODO: After the user connects their accounts, add a new option for "add a new account"
  return (
    <>
      <p>User: {session.user.email}</p>
      <p>Link token: {linkTokenResponse.link_token}</p>
      {userResponse.items.length === 0 ? (
        <PlaidLink userId={userResponse.id} linkToken={linkTokenResponse.link_token} />
      ) : (
        <Transactions transactions={transactions}
        />
      )}
      <SignOut />
    </>
  )
}
