/*
  Warnings:

  - A unique constraint covering the columns `[cpf]` on the table `customers` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "cpf" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "customers_cpf_key" ON "customers"("cpf");
