/*
  Warnings:

  - You are about to drop the column `cursorId` on the `Item` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Item" DROP CONSTRAINT "Item_cursorId_fkey";

-- AlterTable
ALTER TABLE "Item" DROP COLUMN "cursorId";

-- AddForeignKey
ALTER TABLE "Cursor" ADD CONSTRAINT "Cursor_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
