import prisma from "@/functions/db"
import { Transaction } from "@/generated/prisma"

export async function getTransactions(accountId: string) {
  return await prisma.transaction.findMany({
    where: {
      accountId: accountId,
    }
  })
}

async function deleteTransaction(id: string) {
  const resp = await prisma.transaction.delete({
    where: {
      id: id,
    }
  })
  console.log("Deleted transaction:", resp)
}

export async function deleteTransactions(ids: string[]) {
  // Delete transactions by IDs
  for (const transactionId of ids) {
    await deleteTransaction(transactionId)
  }
}

export async function updateTransactions(transactions: Transaction[]) {
  for (const transaction of transactions) {
    await updateTransaction(transaction)
  }
}

async function updateTransaction(transaction: Transaction) {
  const resp = await prisma.transaction.update({
    where: {
      id: transaction.id,
    },
    data: {
      accountId: transaction.accountId,
      currencyCode: transaction.currencyCode,
      amount: transaction.amount,
      date: transaction.date,
      name: transaction.name,
      updatedAt: new Date(),
      pending: transaction.pending,
    }
  })

  console.log("Updated transaction:", resp)
}

async function createTransaction(transaction: Transaction) {
  try {
    const existingTransaction = await prisma.transaction.findUnique({
      where: {
        id: transaction.id,
      }
    })
    if (existingTransaction) {
      console.log("Transaction already exists.")
      return
    }
    const resp = await prisma.transaction.create({
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
    console.log("Created transaction:", resp)
  } catch (error) {
    console.error("Error creating transaction:", error)
  }
}

export async function createTransactions(transactions: Transaction[]) {
  // Create new transactions
  for (const transaction of transactions) {
    await createTransaction(transaction)
  }
}
