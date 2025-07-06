import { User } from "@/generated/prisma";
import prisma from "@/functions/db/index";
import { CreateUserInput } from "./types";

export async function createUser(userInput: CreateUserInput): Promise<User> {
  const user = await prisma.user.create({
    data: {
      name: userInput.Name,
      email: userInput.Email,
      image: userInput.Image,
    }
  });
  return user as User;
}
