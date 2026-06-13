-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('BAJA', 'MEDIA', 'ALTA', 'URGENTE');

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "priority" "Priority" NOT NULL DEFAULT 'MEDIA';
