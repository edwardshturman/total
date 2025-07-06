// Functions
import { auth, isAuthorized } from "@/lib/auth"
import { createLinkToken } from "@/functions/plaid"
import { redirect, unauthorized } from "next/navigation"

// Components
import { SignOut } from "@/components/SignOut"
import { PlaidLink } from "@/components/PlaidLink"
import { getUserByEmail } from "@/functions/db/queries"
import { CreateUserInput } from "@/functions/db/types"
import { createUser } from "@/functions/db/mutations"

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

  return (
    <>
      <p>User: {session.user.email}</p>
      <p>Link token: {linkTokenResponse.link_token}</p>
      {userResponse.Accounts.length == 0 && (
        <PlaidLink userId={userResponse.User.id} linkToken={linkTokenResponse.link_token} />
      )}
      <SignOut />
    </>
  )
}
