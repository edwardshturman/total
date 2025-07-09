/*
  Warnings:

  - The primary key for the `Cursor` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Cursor` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Cursor_accessToken_key";

-- AlterTable
ALTER TABLE "Cursor" DROP CONSTRAINT "Cursor_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "Cursor_pkey" PRIMARY KEY ("accessToken");
