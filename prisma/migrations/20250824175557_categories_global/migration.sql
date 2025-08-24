/*
  Warnings:

  - You are about to drop the column `userId` on the `Category` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Category" DROP CONSTRAINT "Category_userId_fkey";

-- DropIndex
DROP INDEX "public"."Category_userId_idx";

-- DropIndex
DROP INDEX "public"."Category_userId_name_key";

-- AlterTable
ALTER TABLE "public"."Category" DROP COLUMN "userId";
