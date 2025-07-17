import prisma from "@/functions/db"

type CreateAccountInput = {
  id: string
  name: string
  mask?: string
  itemId: string
}

export async function createAccount(accountInput: CreateAccountInput) {
  return await prisma.account.create({
    data: {
      id: accountInput.id,
      name: accountInput.name,
      mask: accountInput.mask,
      itemId: accountInput.itemId
    }
  })
}

export async function getAccountsByItemId(itemId: string) {
  return await prisma.account.findMany({
    where: { itemId }
  })
}
