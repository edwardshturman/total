import prisma from "@/functions/db"
import type { Transaction } from "@/generated/prisma"

export type ClientFriendlyTransaction = Omit<Transaction, "amount"> & {
  amount: number
}

export async function getTransactions(accountId: string) {
  return await prisma.transaction.findMany({
    where: { accountId }
  })
}

export function convertTransactionForClient(transaction: Transaction) {
  const clientFriendlyTransaction: ClientFriendlyTransaction = {
    ...transaction,
    amount: transaction.amount.toNumber()
  }
  return clientFriendlyTransaction
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
      amount: transaction.amount,
      date: transaction.date,
      pending: transaction.pending,
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
      accountId: transaction.accountId,
      id: transaction.id,
      name: transaction.name,
      date: transaction.date,
      amount: transaction.amount,
      currencyCode: transaction.currencyCode,
      pending: transaction.pending
    }
  })
}
