/*
  Warnings:

  - You are about to drop the column `transactionId` on the `TransactionCategory` table. All the data in the column will be lost.
  - Added the required column `detailed` to the `TransactionCategory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `primary` to the `TransactionCategory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TransactionCategory" DROP COLUMN "transactionId",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "detailed" TEXT NOT NULL,
ADD COLUMN     "primary" TEXT NOT NULL;
