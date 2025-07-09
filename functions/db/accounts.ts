import prisma from "@/functions/db"

export type CreateAccountInput = {
  id: string
  name: string
  mask: string
  userId: string
  itemId: string
}

export async function createAccount(accountInput: CreateAccountInput) {
  return await prisma.account.create({
    data: {
      id: accountInput.id,
      name: accountInput.name,
      mask: accountInput.mask,
      userId: accountInput.userId,
      itemId: accountInput.itemId
    }
  })
}
