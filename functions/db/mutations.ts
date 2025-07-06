import { User, Account, Item, Transaction } from "@/generated/prisma";
import prisma from "@/functions/db/index";
import { CreateAccountInput, CreateCursorInput, CreateItemInput, CreateUserInput, UpdateCursorInput } from "./types";

export async function createUser(userInput: CreateUserInput) {
  const resp = await prisma.user.create({
    data: {
      name: userInput.Name,
      email: userInput.Email,
      image: userInput.Image,
    },
    include: {
      items: {
        include: {
          accounts: true,
        }
      },
    }
  });

  return resp;
}

export async function createItem(itemInput: CreateItemInput): Promise<Item> {
  const resp = await prisma.item.create({
    data: {
      id: itemInput.ID,
      userId: itemInput.UserID,
      accessToken: itemInput.AccessToken,
      institutionName: itemInput.InstitutionName || "",
    }
  })
  return resp;
}

export async function createAccount(accountInput: CreateAccountInput): Promise<Account> {
  const resp = await prisma.account.create({
    data: {
      id: accountInput.ID,
      name: accountInput.Name,
      officialName: accountInput.OfficialName,
      mask: accountInput.Mask,
      userId: accountInput.UserID,
      itemId: accountInput.ItemID,
    }
  })

  return resp;
}

export async function createCursor(cursorInput: CreateCursorInput) {
  const resp = await prisma.cursor.create({
    data: {
      accessToken: cursorInput.AccessToken,
      cursor: cursorInput.Cursor,
    }
  })

  return resp;
}

export async function updateCursor(cursorInput: UpdateCursorInput) {
  const resp = await prisma.cursor.update({
    where: {
      id: cursorInput.ID,
    },
    data: {
      cursor: cursorInput.Cursor,
    }
  })
  return resp;
}

async function deleteTransaction(id: string) {
  const resp = await prisma.transaction.delete({
    where: {
      id: id,
    }
  })
  console.log("Deleted transaction:", resp);
}

export async function deleteTransactions(ids: string[]) {
  // Delete transactions by IDs
  for (const transactionId of ids) {
    await deleteTransaction(transactionId);
  }
}

export async function updateTransactions(transactions: Transaction[]) {
  for (const transaction of transactions) {
    await updateTransaction(transaction);
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

  console.log("Updated transaction:", resp);
}

async function createTransaction(transaction: Transaction) {
  try {
    const existingTransaction = await prisma.transaction.findUnique({
      where: {
        id: transaction.id,
      }
    })
    if (existingTransaction) {
      console.log("Transaction already exists.");
      return;
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
    console.log("Created transaction:", resp);
  } catch (error) {
    console.error("Error creating transaction:", error);
  }
}

export async function createTransactions(transactions: Transaction[]) {
  // Create new transactions
  for (const transaction of transactions) {
    await createTransaction(transaction);
  }
}
