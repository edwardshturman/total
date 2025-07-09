
export type CreateUserInput = {
  Name: string;
  Email: string;
  Image: string | null | undefined;
}
import { Account, Transaction, User } from "@/generated/prisma"

export type UserWithAccountsAndTransactions = {
  User: User
  Accounts: Account[]
  Transactions: Transaction[]
}

export type CreateAccountInput = {
  id: string
  name: string
  mask: string
  userId: string
  itemId: string
}

export type CreateItemInput = {
  id: string
  userId: string
  accessToken: string
  InstitutionName: string
}

export type CreateCursorInput = {
  AccessToken: string;
  Cursor: string;
}

export type UpdateCursorInput = {
  ID: string;
  Cursor: string;
}
