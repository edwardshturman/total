import prisma from "@/functions/db/index";

export async function getUserByEmail(email: string) {
  const resp = await prisma.user.findUnique({
    where: {
      email: email,
    },
    include: {
      items: {
        include: {
          accounts: true,
        }
      },
    }
  })

  return resp;
}

export async function getCursor(accessToken: string) {
  const resp = await prisma.cursor.findUnique({
    where: {
      accessToken: accessToken,
    }
  })
  return resp;
}

export async function getTransactions(accountId: string) {
  const resp = await prisma.transaction.findMany({
    where: {
      accountId: accountId,
    }
  })
  return resp;
}

