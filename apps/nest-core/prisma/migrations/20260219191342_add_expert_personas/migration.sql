/*
  Warnings:

  - The `aiReasoning` column on the `ScrapedOffer` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropForeignKey
ALTER TABLE "OfferPriceHistory" DROP CONSTRAINT "OfferPriceHistory_offerId_fkey";

-- DropForeignKey
ALTER TABLE "ScrapedOffer" DROP CONSTRAINT "ScrapedOffer_searchConfigId_fkey";

-- AlterTable
ALTER TABLE "ScrapedOffer" DROP COLUMN "aiReasoning",
ADD COLUMN     "aiReasoning" JSONB;

-- AlterTable
ALTER TABLE "SearchConfig" ADD COLUMN     "personaId" TEXT,
ADD COLUMN     "userIntent" TEXT;

-- CreateTable
CREATE TABLE "ExpertPersona" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "instruction" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExpertPersona_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExpertPersona_name_key" ON "ExpertPersona"("name");

-- AddForeignKey
ALTER TABLE "SearchConfig" ADD CONSTRAINT "SearchConfig_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "ExpertPersona"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScrapedOffer" ADD CONSTRAINT "ScrapedOffer_searchConfigId_fkey" FOREIGN KEY ("searchConfigId") REFERENCES "SearchConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferPriceHistory" ADD CONSTRAINT "OfferPriceHistory_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "ScrapedOffer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
