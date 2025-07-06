import { User, Account } from "@/generated/prisma";
import prisma from "@/functions/db/index";
import { CreateAccountInput, CreateUserInput, UserWithAccounts } from "./types";

export async function createUser(userInput: CreateUserInput): Promise<UserWithAccounts> {
  const resp = await prisma.user.create({
    data: {
      name: userInput.Name,
      email: userInput.Email,
      image: userInput.Image,
    }
  });

  const user: UserWithAccounts = {
    User: resp as User,
    Accounts: [],
  }

  return user
}

export async function createAccount(accountInput: CreateAccountInput): Promise<Account> {
  const resp = await prisma.account.create({
    data: {
      id: accountInput.ID,
      name: accountInput.Name,
      officialName: accountInput.OfficialName,
      mask: accountInput.Mask,
      userId: accountInput.UserID,
    }
  })

  return resp as Account;
}
