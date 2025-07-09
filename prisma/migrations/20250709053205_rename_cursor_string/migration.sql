/*
  Warnings:

  - You are about to drop the column `cursor` on the `Cursor` table. All the data in the column will be lost.
  - Added the required column `string` to the `Cursor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Cursor" DROP COLUMN "cursor",
ADD COLUMN     "string" TEXT NOT NULL;
