/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `Shift` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Shift_code_key" ON "Shift"("code");
