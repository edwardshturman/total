import prisma from "@/functions/db";

type CursorInput = {
  itemId: string;
  string: string;
};

export async function getCursor(itemId: string) {
  return await prisma.cursor.findUnique({
    where: { itemId },
  });
}

export async function createCursor(cursorInput: CursorInput) {
  return await prisma.cursor.create({
    data: {
      itemId: cursorInput.itemId,
      string: cursorInput.string,
    },
  });
}

export async function updateCursor(cursorInput: CursorInput) {
  return await prisma.cursor.update({
    where: { itemId: cursorInput.itemId },
    data: { string: cursorInput.string },
  });
}
