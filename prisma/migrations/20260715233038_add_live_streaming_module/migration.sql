/*
  Warnings:

  - You are about to drop the column `nombre` on the `Area` table. All the data in the column will be lost.
  - You are about to drop the column `proyectoId` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `accionId` on the `Kpi` table. All the data in the column will be lost.
  - You are about to drop the column `meta` on the `Kpi` table. All the data in the column will be lost.
  - You are about to drop the column `nombre` on the `Kpi` table. All the data in the column will be lost.
  - You are about to drop the column `tipo` on the `Kpi` table. All the data in the column will be lost.
  - You are about to drop the column `unidad` on the `Kpi` table. All the data in the column will be lost.
  - You are about to drop the column `valorActual` on the `Kpi` table. All the data in the column will be lost.
  - You are about to drop the column `accionId` on the `Reminder` table. All the data in the column will be lost.
  - You are about to drop the column `proyectoId` on the `Reminder` table. All the data in the column will be lost.
  - You are about to drop the `Accion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `KpiRegistro` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Proyecto` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProyectoComment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProyectoParticipante` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `Area` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `Area` table without a default value. This is not possible if the table is not empty.
  - Added the required column `actionId` to the `Kpi` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Kpi` table without a default value. This is not possible if the table is not empty.
  - Added the required column `target` to the `Kpi` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Kpi` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unit` to the `Kpi` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('NUEVO', 'EN_PROGRESO', 'REVISION', 'COMPLETADO');

-- CreateEnum
CREATE TYPE "ProjectHealth" AS ENUM ('VERDE', 'AMARILLO', 'ROJO');

-- CreateEnum
CREATE TYPE "MemberRole" AS ENUM ('OWNER', 'SOPORTE', 'OBSERVER');

-- CreateEnum
CREATE TYPE "KpiType" AS ENUM ('ACUMULABLE', 'ESTADO');

-- DropForeignKey
ALTER TABLE "Accion" DROP CONSTRAINT "Accion_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "Accion" DROP CONSTRAINT "Accion_parentId_fkey";

-- DropForeignKey
ALTER TABLE "Accion" DROP CONSTRAINT "Accion_proyectoId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_proyectoId_fkey";

-- DropForeignKey
ALTER TABLE "Kpi" DROP CONSTRAINT "Kpi_accionId_fkey";

-- DropForeignKey
ALTER TABLE "KpiRegistro" DROP CONSTRAINT "KpiRegistro_kpiId_fkey";

-- DropForeignKey
ALTER TABLE "KpiRegistro" DROP CONSTRAINT "KpiRegistro_userId_fkey";

-- DropForeignKey
ALTER TABLE "Proyecto" DROP CONSTRAINT "Proyecto_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "ProyectoComment" DROP CONSTRAINT "ProyectoComment_proyectoId_fkey";

-- DropForeignKey
ALTER TABLE "ProyectoComment" DROP CONSTRAINT "ProyectoComment_userId_fkey";

-- DropForeignKey
ALTER TABLE "ProyectoParticipante" DROP CONSTRAINT "ProyectoParticipante_areaId_fkey";

-- DropForeignKey
ALTER TABLE "ProyectoParticipante" DROP CONSTRAINT "ProyectoParticipante_proyectoId_fkey";

-- DropForeignKey
ALTER TABLE "ProyectoParticipante" DROP CONSTRAINT "ProyectoParticipante_userId_fkey";

-- DropForeignKey
ALTER TABLE "Reminder" DROP CONSTRAINT "Reminder_accionId_fkey";

-- DropForeignKey
ALTER TABLE "Reminder" DROP CONSTRAINT "Reminder_proyectoId_fkey";

-- DropIndex
DROP INDEX "Area_nombre_key";

-- AlterTable
ALTER TABLE "Area" RENAME COLUMN "nombre" TO "name";

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "proyectoId",
ADD COLUMN     "projectId" TEXT;

-- AlterTable
ALTER TABLE "Kpi" DROP COLUMN "accionId",
DROP COLUMN "meta",
DROP COLUMN "nombre",
DROP COLUMN "tipo",
DROP COLUMN "unidad",
DROP COLUMN "valorActual",
ADD COLUMN     "actionId" TEXT NOT NULL,
ADD COLUMN     "currentValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "target" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "type" "KpiType" NOT NULL,
ADD COLUMN     "unit" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Reminder" DROP COLUMN "accionId",
DROP COLUMN "proyectoId",
ADD COLUMN     "actionId" TEXT,
ADD COLUMN     "projectId" TEXT;

-- DropTable
DROP TABLE "Accion";

-- DropTable
DROP TABLE "KpiRegistro";

-- DropTable
DROP TABLE "Proyecto";

-- DropTable
DROP TABLE "ProyectoComment";

-- DropTable
DROP TABLE "ProyectoParticipante";

-- DropEnum
DROP TYPE "RolParticipante";

-- DropEnum
DROP TYPE "SaludProyecto";

-- DropEnum
DROP TYPE "StatusProyecto";

-- DropEnum
DROP TYPE "TipoKpi";

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'NUEVO',
    "targetDate" TIMESTAMP(3) NOT NULL,
    "globalProgress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "health" "ProjectHealth" NOT NULL DEFAULT 'VERDE',
    "creatorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectMember" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleType" "MemberRole" NOT NULL,
    "areaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectAction" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "ownerId" TEXT,
    "projectId" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KpiRecord" (
    "id" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "note" TEXT,
    "kpiId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KpiRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectComment" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectComment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectMember_projectId_userId_key" ON "ProjectMember"("projectId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Area_name_key" ON "Area"("name");

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "ProjectAction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectAction" ADD CONSTRAINT "ProjectAction_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectAction" ADD CONSTRAINT "ProjectAction_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectAction" ADD CONSTRAINT "ProjectAction_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ProjectAction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kpi" ADD CONSTRAINT "Kpi_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "ProjectAction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KpiRecord" ADD CONSTRAINT "KpiRecord_kpiId_fkey" FOREIGN KEY ("kpiId") REFERENCES "Kpi"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KpiRecord" ADD CONSTRAINT "KpiRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectComment" ADD CONSTRAINT "ProjectComment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectComment" ADD CONSTRAINT "ProjectComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
