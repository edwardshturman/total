import prisma from "@/functions/db"
import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"

if (!process.env.GOOGLE_CLIENT_ID) {
  throw new Error("Missing env var GOOGLE_CLIENT_ID")
}
if (!process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error("Missing env var GOOGLE_CLIENT_SECRET")
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql"
  }),
  socialProviders: {
    google: {
      prompt: "select_account",
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    }
  }
})
