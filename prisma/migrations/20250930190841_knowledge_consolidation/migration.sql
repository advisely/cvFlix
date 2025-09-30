/*
  Warnings:

  - You are about to drop the `Certification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Education` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Skill` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `certificationId` on the `Media` table. All the data in the column will be lost.
  - You are about to drop the column `educationId` on the `Media` table. All the data in the column will be lost.
  - You are about to drop the column `skillId` on the `Media` table. All the data in the column will be lost.
  - You are about to drop the column `certificationsLabel` on the `NavbarConfig` table. All the data in the column will be lost.
  - You are about to drop the column `certificationsLabelFr` on the `NavbarConfig` table. All the data in the column will be lost.
  - You are about to drop the column `educationLabel` on the `NavbarConfig` table. All the data in the column will be lost.
  - You are about to drop the column `educationLabelFr` on the `NavbarConfig` table. All the data in the column will be lost.
  - You are about to drop the column `skillsLabel` on the `NavbarConfig` table. All the data in the column will be lost.
  - You are about to drop the column `skillsLabelFr` on the `NavbarConfig` table. All the data in the column will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Certification";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Education";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Skill";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Knowledge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kind" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleFr" TEXT,
    "issuer" TEXT,
    "issuerFr" TEXT,
    "category" TEXT,
    "categoryFr" TEXT,
    "description" TEXT,
    "descriptionFr" TEXT,
    "competencyLevel" TEXT,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "validUntil" DATETIME,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "url" TEXT,
    "location" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Media" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "experienceId" TEXT,
    "experienceHomepageId" TEXT,
    "experienceCardId" TEXT,
    "knowledgeId" TEXT,
    "highlightId" TEXT,
    "highlightHomepageId" TEXT,
    "highlightCardId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Media_highlightCardId_fkey" FOREIGN KEY ("highlightCardId") REFERENCES "Highlight" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Media_highlightHomepageId_fkey" FOREIGN KEY ("highlightHomepageId") REFERENCES "Highlight" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Media_highlightId_fkey" FOREIGN KEY ("highlightId") REFERENCES "Highlight" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Media_knowledgeId_fkey" FOREIGN KEY ("knowledgeId") REFERENCES "Knowledge" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Media_experienceCardId_fkey" FOREIGN KEY ("experienceCardId") REFERENCES "Experience" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Media_experienceHomepageId_fkey" FOREIGN KEY ("experienceHomepageId") REFERENCES "Experience" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Media_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES "Experience" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Media" ("createdAt", "experienceCardId", "experienceHomepageId", "experienceId", "highlightCardId", "highlightHomepageId", "highlightId", "id", "type", "url") SELECT "createdAt", "experienceCardId", "experienceHomepageId", "experienceId", "highlightCardId", "highlightHomepageId", "highlightId", "id", "type", "url" FROM "Media";
DROP TABLE "Media";
ALTER TABLE "new_Media" RENAME TO "Media";
CREATE TABLE "new_NavbarConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "logoText" TEXT NOT NULL DEFAULT 'resumeflex',
    "logoTextFr" TEXT NOT NULL DEFAULT 'resumeflex',
    "logoImageUrl" TEXT,
    "useImageLogo" BOOLEAN NOT NULL DEFAULT false,
    "workExperienceLabel" TEXT NOT NULL DEFAULT 'Work Experience',
    "workExperienceLabelFr" TEXT NOT NULL DEFAULT 'Expérience de travail',
    "careerSeriesLabel" TEXT NOT NULL DEFAULT 'Career Series',
    "careerSeriesLabelFr" TEXT NOT NULL DEFAULT 'Série de carrière',
    "knowledgeLabel" TEXT NOT NULL DEFAULT 'Knowledge',
    "knowledgeLabelFr" TEXT NOT NULL DEFAULT 'Connaissances',
    "backgroundColor" TEXT NOT NULL DEFAULT '#141414',
    "backgroundType" TEXT NOT NULL DEFAULT 'color',
    "backgroundImageUrl" TEXT,
    "gradientFrom" TEXT NOT NULL DEFAULT '#141414',
    "gradientTo" TEXT NOT NULL DEFAULT '#1a1a1a',
    "fontFamily" TEXT NOT NULL DEFAULT 'Inter',
    "logoFontFamily" TEXT NOT NULL DEFAULT 'Inter',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_NavbarConfig" ("backgroundColor", "backgroundImageUrl", "backgroundType", "careerSeriesLabel", "careerSeriesLabelFr", "createdAt", "fontFamily", "gradientFrom", "gradientTo", "id", "logoFontFamily", "logoImageUrl", "logoText", "logoTextFr", "updatedAt", "useImageLogo", "workExperienceLabel", "workExperienceLabelFr") SELECT "backgroundColor", "backgroundImageUrl", "backgroundType", "careerSeriesLabel", "careerSeriesLabelFr", "createdAt", "fontFamily", "gradientFrom", "gradientTo", "id", "logoFontFamily", "logoImageUrl", "logoText", "logoTextFr", "updatedAt", "useImageLogo", "workExperienceLabel", "workExperienceLabelFr" FROM "NavbarConfig";
DROP TABLE "NavbarConfig";
ALTER TABLE "new_NavbarConfig" RENAME TO "NavbarConfig";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Knowledge_kind_idx" ON "Knowledge"("kind");

-- CreateIndex
CREATE INDEX "Knowledge_category_idx" ON "Knowledge"("category");
