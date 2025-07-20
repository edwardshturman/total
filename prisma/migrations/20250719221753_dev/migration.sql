/*
  Warnings:

  - You are about to drop the `TransactionCategory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "TransactionCategory";

-- CreateTable
CREATE TABLE "PrimaryTransactionCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "PrimaryTransactionCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DetailedTransactionCategory" (
    "id" TEXT NOT NULL,
    "primaryTransactionCategoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "DetailedTransactionCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PrimaryTransactionCategory_name_key" ON "PrimaryTransactionCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "DetailedTransactionCategory_name_key" ON "DetailedTransactionCategory"("name");

-- AddForeignKey
ALTER TABLE "DetailedTransactionCategory" ADD CONSTRAINT "DetailedTransactionCategory_primaryTransactionCategoryId_fkey" FOREIGN KEY ("primaryTransactionCategoryId") REFERENCES "PrimaryTransactionCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
