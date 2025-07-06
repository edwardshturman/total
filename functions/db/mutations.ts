import { User } from "@/generated/prisma";
import prisma from "@/functions/db/index";
import { CreateUserInput, UserWithAccounts } from "./types";

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
