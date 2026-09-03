/*
  Warnings:

  - A unique constraint covering the columns `[whatsappMessageId]` on the table `Reminder` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "SupportTicketStatus" AS ENUM ('ABIERTO', 'EN_PROGRESO', 'ESPERANDO_USUARIO', 'RESUELTO', 'CERRADO');

-- AlterTable
ALTER TABLE "Reminder" ADD COLUMN     "deliveryStatus" TEXT,
ADD COLUMN     "isTemplate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "supportTicketId" TEXT,
ADD COLUMN     "templateName" TEXT,
ADD COLUMN     "whatsappMessageId" TEXT;

-- CreateTable
CREATE TABLE "SupportTicket" (
    "id" TEXT NOT NULL,
    "folio" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "SupportTicketStatus" NOT NULL DEFAULT 'ABIERTO',
    "priority" "Priority" NOT NULL DEFAULT 'MEDIA',
    "creatorId" TEXT NOT NULL,
    "assignedTechId" TEXT,
    "firstResponseAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "whatsappThreadActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupportTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportComment" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "supportTicketId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "isFromWhatsApp" BOOLEAN NOT NULL DEFAULT false,
    "whatsappMessageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupportComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportAuditLog" (
    "id" TEXT NOT NULL,
    "supportTicketId" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "details" JSONB NOT NULL,
    "timeElapsedSeconds" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupportAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SupportComment_whatsappMessageId_key" ON "SupportComment"("whatsappMessageId");

-- CreateIndex
CREATE UNIQUE INDEX "Reminder_whatsappMessageId_key" ON "Reminder"("whatsappMessageId");

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_supportTicketId_fkey" FOREIGN KEY ("supportTicketId") REFERENCES "SupportTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_assignedTechId_fkey" FOREIGN KEY ("assignedTechId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportComment" ADD CONSTRAINT "SupportComment_supportTicketId_fkey" FOREIGN KEY ("supportTicketId") REFERENCES "SupportTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportComment" ADD CONSTRAINT "SupportComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportAuditLog" ADD CONSTRAINT "SupportAuditLog_supportTicketId_fkey" FOREIGN KEY ("supportTicketId") REFERENCES "SupportTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportAuditLog" ADD CONSTRAINT "SupportAuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
