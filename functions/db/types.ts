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
