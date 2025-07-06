import { Account, Transaction, User } from "@/generated/prisma";
import prisma from "@/functions/db/index";
import { UserWithAccountsAndTransactions } from "./types";

export async function getUserByEmail(email: string): Promise<UserWithAccountsAndTransactions> {
  const resp = await prisma.user.findUnique({
    where: {
      email: email,
    },
  })

  // TODO: fix this to use items instead of accounts
  const user: UserWithAccountsAndTransactions = {
    User: resp as User,
    Accounts: [] as Account[],
    Transactions: [] as Transaction[],
  }
  return user
}

export async function getCursor(accessToken: string) {
  const resp = await prisma.cursor.findUnique({
    where: {
      accessToken: accessToken,
    }
  })
  return resp;
}

