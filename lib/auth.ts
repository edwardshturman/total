import prisma from "@/functions/db"
import { betterAuth } from "better-auth"
import { unauthorized } from "next/navigation"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { createAuthMiddleware, APIError } from "better-auth/api"

if (!process.env.GOOGLE_CLIENT_ID) {
  throw new Error("Missing env var GOOGLE_CLIENT_ID")
}
if (!process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error("Missing env var GOOGLE_CLIENT_SECRET")
}

const whitelistEnvVar = process.env.WHITELIST!
const whitelist = whitelistEnvVar.split(",")

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
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-in/social") {
        return
      }
      if (ctx.body?.email && !whitelist.includes(ctx.body?.email)) {
        unauthorized()
      }
    })
  }
})
