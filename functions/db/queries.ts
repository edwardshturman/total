import { Account, User } from "@/generated/prisma";
import prisma from "@/functions/db/index";
import { UserWithAccountsAndTransactions } from "./types";

export async function getUserByEmail(email: string): Promise<UserWithAccountsAndTransactions> {
  const resp = await prisma.user.findUnique({
    where: {
      email: email,
    },
    include: {
      accounts: {
        include: {
          transactions: true,
        }
      }
    },
  })

  const user: UserWithAccountsAndTransactions = {
    User: resp as User,
    Accounts: resp?.accounts as Account[],
    Transactions: resp?.accounts?.flatMap(account => account.transactions) || [],
  }
  return user
}
