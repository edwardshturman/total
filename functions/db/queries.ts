import { User } from "@/generated/prisma";
import prisma from "@/functions/db/index";

export async function getUserByEmail(email: string): Promise<User> {
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    }
  })

  return user as User;
}
