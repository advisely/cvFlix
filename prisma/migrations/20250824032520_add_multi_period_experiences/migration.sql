-- CreateTable
CREATE TABLE "ExperienceDateRange" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "experienceId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ExperienceDateRange_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES "Experience" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ExperienceDateRange_experienceId_idx" ON "ExperienceDateRange"("experienceId");

-- CreateIndex
CREATE INDEX "ExperienceDateRange_startDate_idx" ON "ExperienceDateRange"("startDate");

-- CreateIndex
CREATE INDEX "ExperienceDateRange_endDate_idx" ON "ExperienceDateRange"("endDate");
