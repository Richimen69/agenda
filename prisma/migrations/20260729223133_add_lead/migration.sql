-- CreateEnum
CREATE TYPE "Department" AS ENUM ('NUEVOS', 'SEMINUEVOS', 'SERVICIO', 'OPERADOR');

-- CreateEnum
CREATE TYPE "ContactMethod" AS ENUM ('WHATSAPP', 'LLAMADA', 'FACEBOOK_MESSENGER', 'INSTAGRAM');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NUEVO', 'ATENDIDO', 'AGENDADO', 'PERDIDO');

-- CreateEnum
CREATE TYPE "RecoveryStatus" AS ENUM ('EN_SEGUIMIENTO', 'NO_CONTACTABLE', 'RECUPERADO_Y_ASIGNADO', 'DESCARTADO');

-- CreateEnum
CREATE TYPE "ContactState" AS ENUM ('R1_POR_CONTACTAR', 'R2_CONTACTADO');

-- CreateTable
CREATE TABLE "Lead" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "phone" TEXT,
    "fullName" TEXT NOT NULL,
    "department" "Department" NOT NULL DEFAULT 'NUEVOS',
    "contactMethod" "ContactMethod" NOT NULL DEFAULT 'WHATSAPP',
    "agent" TEXT,
    "interest" TEXT,
    "status" "LeadStatus" NOT NULL DEFAULT 'NUEVO',
    "contactState" "ContactState",
    "needsRecovery" BOOLEAN NOT NULL DEFAULT false,
    "recoveryStatus" "RecoveryStatus",
    "lostReason" TEXT,
    "firstContactTime" DOUBLE PRECISION,
    "assignment" TEXT,
    "hasAppointment" BOOLEAN NOT NULL DEFAULT false,
    "showedUp" BOOLEAN NOT NULL DEFAULT false,
    "hasQuote" BOOLEAN NOT NULL DEFAULT false,
    "amount" DOUBLE PRECISION,
    "source" TEXT NOT NULL,
    "isReturning" BOOLEAN NOT NULL DEFAULT false,
    "branch" TEXT NOT NULL DEFAULT 'GUERRERO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadComment" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "leadId" INTEGER NOT NULL,
    "author" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadComment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Lead_date_idx" ON "Lead"("date");

-- CreateIndex
CREATE INDEX "Lead_source_idx" ON "Lead"("source");

-- CreateIndex
CREATE INDEX "Lead_status_idx" ON "Lead"("status");

-- CreateIndex
CREATE INDEX "Lead_needsRecovery_idx" ON "Lead"("needsRecovery");

-- AddForeignKey
ALTER TABLE "LeadComment" ADD CONSTRAINT "LeadComment_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
