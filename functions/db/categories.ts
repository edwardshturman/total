import prisma from "@/functions/db"

export async function getPrimaryCategories() {
  return prisma.primaryTransactionCategory.findMany({
    include: {
      transactions: true
    }
  })
}

export async function getDetailedCategories() {
  return prisma.detailedTransactionCategory.findMany({
    include: {
      transactions: true
    }
  })
}
