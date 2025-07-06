import { Account, Transaction, User } from "@/generated/prisma";

export type CreateUserInput = {
  Name: string;
  Email: string;
  Image: string | null | undefined;
}

export type UserWithAccountsAndTransactions = {
  User: User
  Accounts: Account[]
  Transactions: Transaction[]
}

export type CreateAccountInput = {
  ID: string;
  ItemID: string;
  Name?: string;
  OfficialName: string;
  Mask?: string;
  UserID: string;
}

export type CreateItemInput = {
  ID: string;
  UserID: string;
  AccessToken: string;
  InstitutionName?: string;
}

export type CreateCursorInput = {
  AccessToken: string;
  Cursor: string;
}

export type UpdateCursorInput = {
  ID: string;
  Cursor: string;
}
