-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "detailedTransactionCategoryId" TEXT,
ADD COLUMN     "primaryTransactionCategoryId" TEXT;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_primaryTransactionCategoryId_fkey" FOREIGN KEY ("primaryTransactionCategoryId") REFERENCES "PrimaryTransactionCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_detailedTransactionCategoryId_fkey" FOREIGN KEY ("detailedTransactionCategoryId") REFERENCES "DetailedTransactionCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
