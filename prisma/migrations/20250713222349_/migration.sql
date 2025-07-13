/*
  Warnings:

  - The primary key for the `Cursor` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `accessToken` on the `Cursor` table. All the data in the column will be lost.
  - Added the required column `id` to the `Cursor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Cursor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Cursor" DROP CONSTRAINT "Cursor_pkey",
DROP COLUMN "accessToken",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD CONSTRAINT "Cursor_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Item" ALTER COLUMN "encryptionKeyVersion" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_id_fkey" FOREIGN KEY ("id") REFERENCES "Cursor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
