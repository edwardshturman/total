import prisma from "@/functions/db"

export type CreateUserInput = {
  name: string
  email: string
}

export async function getUserByEmail(email: string) {
  return await prisma.user.findUnique({
    where: { email },
    include: {
      items: {
        include: {
          accounts: true
        }
      }
    }
  })
}

export async function createUser(
  name: string,
  email: string
) {
  return await prisma.user.create({
    data: { name, email }
  })
}
