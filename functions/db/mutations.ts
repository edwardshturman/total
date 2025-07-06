import { User, Account, Item } from "@/generated/prisma";
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
      items: true,
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
