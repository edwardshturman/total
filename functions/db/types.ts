import { Account, User } from "@/generated/prisma";

export type CreateUserInput = {
  Name: string;
  Email: string;
  Image: string | null | undefined;
}

export type UserWithAccounts = {
  User: User
  Accounts: Account[]
}

export type CreateAccountInput = {
  ID: string;
  Name: string;
  OfficialName: string;
  Mask: string;
  UserID: string;
}
