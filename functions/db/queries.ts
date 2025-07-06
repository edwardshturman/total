import { Account, User } from "@/generated/prisma";
import prisma from "@/functions/db/index";
import { UserWithAccounts } from "./types";

export async function getUserByEmail(email: string): Promise<UserWithAccounts> {
  const resp = await prisma.user.findUnique({
    where: {
      email: email,
    },
    include: {
      accounts: true,
    },
  })

  const user: UserWithAccounts = {
    User: resp as User,
    Accounts: resp?.accounts as Account[],
  }
  return user
}
