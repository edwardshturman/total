import prisma from "@/functions/db/index";

export async function getUserByEmail(email: string) {
  const resp = await prisma.user.findUnique({
    where: {
      email: email,
    },
    include: {
      items: true,
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

