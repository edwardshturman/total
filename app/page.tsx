// Functions
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

// Constants
import { APP_NAME } from "@/lib/constants"

// Components
import { SignIn } from "@/components/SignIn"

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  if (session) {
    redirect("/plaid")
  }

  return (
    <>
      <h1>{APP_NAME}</h1>
      <SignIn />
    </>
  )
}
