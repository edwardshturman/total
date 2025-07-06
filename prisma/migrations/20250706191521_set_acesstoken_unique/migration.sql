/*
  Warnings:

  - A unique constraint covering the columns `[accessToken]` on the table `Cursor` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Cursor_accessToken_key" ON "Cursor"("accessToken");
