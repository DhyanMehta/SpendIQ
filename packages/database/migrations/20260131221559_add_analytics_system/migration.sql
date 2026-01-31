/*
  Warnings:

  - The values [PENDING_APPROVAL,APPROVED,REJECTED] on the enum `BudgetStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [SENT,RECEIVED,BILLED] on the enum `PurchOrderStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `active` on the `auto_analytical_rules` table. All the data in the column will be lost.
  - You are about to drop the column `targetAccountId` on the `auto_analytical_rules` table. All the data in the column will be lost.
  - You are about to drop the column `departmentId` on the `budgets` table. All the data in the column will be lost.
  - You are about to drop the column `fiscalYear` on the `budgets` table. All the data in the column will be lost.
  - You are about to drop the column `previousVersionId` on the `budgets` table. All the data in the column will be lost.
  - You are about to drop the column `version` on the `budgets` table. All the data in the column will be lost.
  - You are about to drop the column `orderId` on the `purchase_order_lines` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `purchase_orders` table. All the data in the column will be lost.
  - You are about to drop the column `reference` on the `purchase_orders` table. All the data in the column will be lost.
  - You are about to drop the `budget_lines` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `rule_conditions` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[revisionOfId]` on the table `budgets` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[poNumber]` on the table `purchase_orders` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `analyticalAccountId` to the `auto_analytical_rules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `analyticAccountId` to the `budgets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `budgetType` to the `budgets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `budgetedAmount` to the `budgets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `budgets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `budgets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `purchase_order_lines` table without a default value. This is not possible if the table is not empty.
  - Added the required column `purchaseOrderId` to the `purchase_order_lines` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderDate` to the `purchase_orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `poNumber` to the `purchase_orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtotal` to the `purchase_orders` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AnalyticStatus" AS ENUM ('DRAFT', 'CONFIRMED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "BudgetType" AS ENUM ('INCOME', 'EXPENSE');

-- AlterEnum
BEGIN;
CREATE TYPE "BudgetStatus_new" AS ENUM ('DRAFT', 'CONFIRMED', 'REVISED', 'ARCHIVED');
ALTER TABLE "public"."budgets" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "budgets" ALTER COLUMN "status" TYPE "BudgetStatus_new" USING ("status"::text::"BudgetStatus_new");
ALTER TYPE "BudgetStatus" RENAME TO "BudgetStatus_old";
ALTER TYPE "BudgetStatus_new" RENAME TO "BudgetStatus";
DROP TYPE "public"."BudgetStatus_old";
ALTER TABLE "budgets" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "PurchOrderStatus_new" AS ENUM ('DRAFT', 'CONFIRMED', 'CANCELLED');
ALTER TABLE "public"."purchase_orders" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "purchase_orders" ALTER COLUMN "status" TYPE "PurchOrderStatus_new" USING ("status"::text::"PurchOrderStatus_new");
ALTER TYPE "PurchOrderStatus" RENAME TO "PurchOrderStatus_old";
ALTER TYPE "PurchOrderStatus_new" RENAME TO "PurchOrderStatus";
DROP TYPE "public"."PurchOrderStatus_old";
ALTER TABLE "purchase_orders" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- DropForeignKey
ALTER TABLE "budget_lines" DROP CONSTRAINT "budget_lines_budgetId_fkey";

-- DropForeignKey
ALTER TABLE "budget_lines" DROP CONSTRAINT "budget_lines_productId_fkey";

-- DropForeignKey
ALTER TABLE "budgets" DROP CONSTRAINT "budgets_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "budgets" DROP CONSTRAINT "budgets_previousVersionId_fkey";

-- DropForeignKey
ALTER TABLE "purchase_order_lines" DROP CONSTRAINT "purchase_order_lines_orderId_fkey";

-- DropForeignKey
ALTER TABLE "rule_conditions" DROP CONSTRAINT "rule_conditions_ruleId_fkey";

-- DropIndex
DROP INDEX "budgets_departmentId_idx";

-- DropIndex
DROP INDEX "budgets_fiscalYear_idx";

-- DropIndex
DROP INDEX "budgets_previousVersionId_key";

-- DropIndex
DROP INDEX "purchase_orders_reference_key";

-- AlterTable
ALTER TABLE "analytical_accounts" ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "status" "AnalyticStatus" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "auto_analytical_rules" DROP COLUMN "active",
DROP COLUMN "targetAccountId",
ADD COLUMN     "analyticalAccountId" TEXT NOT NULL,
ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "partnerId" TEXT,
ADD COLUMN     "partnerTagId" TEXT,
ADD COLUMN     "productCategoryId" TEXT,
ADD COLUMN     "productId" TEXT,
ADD COLUMN     "status" "AnalyticStatus" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "budgets" DROP COLUMN "departmentId",
DROP COLUMN "fiscalYear",
DROP COLUMN "previousVersionId",
DROP COLUMN "version",
ADD COLUMN     "analyticAccountId" TEXT NOT NULL,
ADD COLUMN     "budgetType" "BudgetType" NOT NULL,
ADD COLUMN     "budgetedAmount" DECIMAL(15,2) NOT NULL,
ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "revisionOfId" TEXT,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "contacts" ADD COLUMN     "createdById" TEXT;

-- AlterTable
ALTER TABLE "invoices" ADD COLUMN     "createdById" TEXT;

-- AlterTable
ALTER TABLE "journal_entries" ADD COLUMN     "createdById" TEXT;

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "createdById" TEXT;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "createdById" TEXT;

-- AlterTable
ALTER TABLE "purchase_order_lines" DROP COLUMN "orderId",
ADD COLUMN     "analyticalAccountId" TEXT,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "purchaseOrderId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "purchase_orders" DROP COLUMN "date",
DROP COLUMN "reference",
ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "orderDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "poNumber" TEXT NOT NULL,
ADD COLUMN     "subtotal" DECIMAL(15,2) NOT NULL,
ADD COLUMN     "taxAmount" DECIMAL(15,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "sales_orders" ADD COLUMN     "createdById" TEXT;

-- DropTable
DROP TABLE "budget_lines";

-- DropTable
DROP TABLE "rule_conditions";

-- DropEnum
DROP TYPE "RuleField";

-- DropEnum
DROP TYPE "RuleOperator";

-- CreateTable
CREATE TABLE "otp_verifications" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "otp_verifications_email_idx" ON "otp_verifications"("email");

-- CreateIndex
CREATE INDEX "analytical_accounts_status_idx" ON "analytical_accounts"("status");

-- CreateIndex
CREATE INDEX "auto_analytical_rules_status_idx" ON "auto_analytical_rules"("status");

-- CreateIndex
CREATE INDEX "auto_analytical_rules_priority_idx" ON "auto_analytical_rules"("priority");

-- CreateIndex
CREATE UNIQUE INDEX "budgets_revisionOfId_key" ON "budgets"("revisionOfId");

-- CreateIndex
CREATE INDEX "budgets_analyticAccountId_idx" ON "budgets"("analyticAccountId");

-- CreateIndex
CREATE INDEX "budgets_startDate_endDate_idx" ON "budgets"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "budgets_status_idx" ON "budgets"("status");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_orders_poNumber_key" ON "purchase_orders"("poNumber");

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytical_accounts" ADD CONSTRAINT "analytical_accounts_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_analyticAccountId_fkey" FOREIGN KEY ("analyticAccountId") REFERENCES "analytical_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_revisionOfId_fkey" FOREIGN KEY ("revisionOfId") REFERENCES "budgets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_lines" ADD CONSTRAINT "purchase_order_lines_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "purchase_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_lines" ADD CONSTRAINT "purchase_order_lines_analyticalAccountId_fkey" FOREIGN KEY ("analyticalAccountId") REFERENCES "analytical_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auto_analytical_rules" ADD CONSTRAINT "auto_analytical_rules_partnerTagId_fkey" FOREIGN KEY ("partnerTagId") REFERENCES "tags"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auto_analytical_rules" ADD CONSTRAINT "auto_analytical_rules_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auto_analytical_rules" ADD CONSTRAINT "auto_analytical_rules_productCategoryId_fkey" FOREIGN KEY ("productCategoryId") REFERENCES "product_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auto_analytical_rules" ADD CONSTRAINT "auto_analytical_rules_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auto_analytical_rules" ADD CONSTRAINT "auto_analytical_rules_analyticalAccountId_fkey" FOREIGN KEY ("analyticalAccountId") REFERENCES "analytical_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auto_analytical_rules" ADD CONSTRAINT "auto_analytical_rules_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
