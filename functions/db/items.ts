import prisma from "@/functions/db"

export type CreateItemInput = {
  id: string
  userId: string
  accessToken: string
  institutionName: string
}

export async function getUserItems(userId: string) {
  return await prisma.item.findMany({
    where: { userId }
  })
}

export async function createItem(itemInput: CreateItemInput) {
  return await prisma.item.create({
    data: {
      id: itemInput.id,
      userId: itemInput.userId,
      accessToken: itemInput.accessToken,
      institutionName: itemInput.institutionName
    }
  })
}
