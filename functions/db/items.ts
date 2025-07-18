import prisma from "@/functions/db"

type CreateItemInput = {
  id: string
  userId: string
  accessToken: string
  encryptionKeyVersion: string
  institutionName: string
}

export async function getItems(userId: string) {
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
      encryptionKeyVersion: itemInput.encryptionKeyVersion,
      institutionName: itemInput.institutionName
    }
  })
}
