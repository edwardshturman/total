import { User, Account, Item } from "@/generated/prisma";
import prisma from "@/functions/db/index";
import { CreateAccountInput, CreateItemInput, CreateUserInput, UserWithAccountsAndTransactions } from "./types";

export async function createUser(userInput: CreateUserInput): Promise<UserWithAccountsAndTransactions> {
  const resp = await prisma.user.create({
    data: {
      name: userInput.Name,
      email: userInput.Email,
      image: userInput.Image,
    }
  });

  const user: UserWithAccountsAndTransactions = {
    User: resp as User,
    Accounts: [],
    Transactions: [],
  }

  return user
}

export async function createItem(itemInput: CreateItemInput): Promise<Item> {
  const resp = await prisma.item.create({
    data: {
      id: itemInput.ID,
      userId: itemInput.UserID,
      accessToken: itemInput.AccessToken,
      institutionName: itemInput.InstitutionName || "",
    }
  })
  return resp;
}

export async function createAccount(accountInput: CreateAccountInput): Promise<Account> {
  const resp = await prisma.account.create({
    data: {
      id: accountInput.ID,
      name: accountInput.Name,
      officialName: accountInput.OfficialName,
      mask: accountInput.Mask,
      userId: accountInput.UserID,
      itemId: accountInput.ItemID,
    }
  })

  return resp;
}
