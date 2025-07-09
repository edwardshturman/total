import prisma from "@/functions/db"
import type { Transaction } from "@/generated/prisma"

export async function getTransactions(accountId: string) {
  return await prisma.transaction.findMany({
    where: { accountId }
  })
}

export async function deleteTransaction(id: string) {
  return await prisma.transaction.deleteMany({
    where: { id }
  })
}

export async function updateTransaction(transaction: Transaction) {
  return await prisma.transaction.update({
    where: { id: transaction.id },
    data: {
      name: transaction.name,
      date: transaction.date,
      amount: transaction.amount,
      pending: transaction.pending,
      accountId: transaction.accountId,
      currencyCode: transaction.currencyCode,
      updatedAt: new Date()
    }
  })
}

export async function createTransaction(transaction: Transaction) {
  const existingTransaction = await prisma.transaction.findUnique({
    where: { id: transaction.id }
  })
  if (existingTransaction) {
    return existingTransaction
  }

  return await prisma.transaction.create({
    data: {
      id: transaction.id,
      accountId: transaction.accountId,
      currencyCode: transaction.currencyCode,
      amount: transaction.amount,
      date: transaction.date,
      name: transaction.name,
      pending: transaction.pending,
    }
  })
}
