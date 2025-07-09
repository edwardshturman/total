import prisma from "@/functions/db"

export type CreateCursorInput = {
  accessToken: string
  cursor: string
}

export type UpdateCursorInput = {
  accessToken: string
  cursor: string
}

export async function getCursor(accessToken: string) {
  return await prisma.cursor.findUnique({
    where: { accessToken }
  })
}

export async function createCursor(cursorInput: CreateCursorInput) {
  return await prisma.cursor.create({
    data: {
      accessToken: cursorInput.accessToken,
      cursor: cursorInput.cursor
    }
  })
}

export async function updateCursor(cursorInput: UpdateCursorInput) {
  return await prisma.cursor.update({
    where: { accessToken: cursorInput.accessToken },
    data: { cursor: cursorInput.cursor }
  })
}
