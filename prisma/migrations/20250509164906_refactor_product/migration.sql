/*
  Warnings:

  - You are about to drop the column `publishedAt` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `productTranslations` on the `ProductSKUSnapshot` table. All the data in the column will be lost.
  - Added the required column `description` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "publishedAt",
ADD COLUMN     "description" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ProductSKUSnapshot" DROP COLUMN "productTranslations";

