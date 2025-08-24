/*
  Warnings:

  - You are about to drop the column `company` on the `Highlight` table. All the data in the column will be lost.
  - You are about to drop the column `companyFr` on the `Highlight` table. All the data in the column will be lost.
  - Added the required column `companyId` to the `Highlight` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Highlight" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "titleFr" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "description" TEXT,
    "descriptionFr" TEXT,
    "startDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Highlight_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Highlight" ("createdAt", "description", "descriptionFr", "id", "startDate", "title", "titleFr") SELECT "createdAt", "description", "descriptionFr", "id", "startDate", "title", "titleFr" FROM "Highlight";
DROP TABLE "Highlight";
ALTER TABLE "new_Highlight" RENAME TO "Highlight";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
