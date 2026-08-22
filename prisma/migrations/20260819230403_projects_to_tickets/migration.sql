/*
  Warnings:

  - A unique constraint covering the columns `[projectActionId]` on the table `Subtask` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[projectActionId]` on the table `Ticket` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Subtask" ADD COLUMN     "projectActionId" TEXT;

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "projectActionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Subtask_projectActionId_key" ON "Subtask"("projectActionId");

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_projectActionId_key" ON "Ticket"("projectActionId");

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_projectActionId_fkey" FOREIGN KEY ("projectActionId") REFERENCES "ProjectAction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subtask" ADD CONSTRAINT "Subtask_projectActionId_fkey" FOREIGN KEY ("projectActionId") REFERENCES "ProjectAction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
