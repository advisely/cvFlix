-- CreateTable
CREATE TABLE "Contribution" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "titleFr" TEXT,
    "organization" TEXT,
    "organizationFr" TEXT,
    "role" TEXT,
    "roleFr" TEXT,
    "description" TEXT,
    "descriptionFr" TEXT,
    "type" TEXT NOT NULL DEFAULT 'OPEN_SOURCE',
    "impact" TEXT,
    "impactFr" TEXT,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "url" TEXT,
    "downloadUrl" TEXT,
    "thumbnailUrl" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "RecommendedBook" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "titleFr" TEXT,
    "author" TEXT NOT NULL,
    "authorFr" TEXT,
    "recommendedReason" TEXT,
    "recommendedReasonFr" TEXT,
    "summary" TEXT,
    "summaryFr" TEXT,
    "purchaseUrl" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "coverImageUrl" TEXT,
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
    "contributionId" TEXT,
    "bookId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Media_highlightCardId_fkey" FOREIGN KEY ("highlightCardId") REFERENCES "Highlight" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Media_highlightHomepageId_fkey" FOREIGN KEY ("highlightHomepageId") REFERENCES "Highlight" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Media_highlightId_fkey" FOREIGN KEY ("highlightId") REFERENCES "Highlight" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Media_knowledgeId_fkey" FOREIGN KEY ("knowledgeId") REFERENCES "Knowledge" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Media_contributionId_fkey" FOREIGN KEY ("contributionId") REFERENCES "Contribution" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Media_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "RecommendedBook" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Media_experienceCardId_fkey" FOREIGN KEY ("experienceCardId") REFERENCES "Experience" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Media_experienceHomepageId_fkey" FOREIGN KEY ("experienceHomepageId") REFERENCES "Experience" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Media_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES "Experience" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Media" ("createdAt", "experienceCardId", "experienceHomepageId", "experienceId", "highlightCardId", "highlightHomepageId", "highlightId", "id", "knowledgeId", "type", "url") SELECT "createdAt", "experienceCardId", "experienceHomepageId", "experienceId", "highlightCardId", "highlightHomepageId", "highlightId", "id", "knowledgeId", "type", "url" FROM "Media";
DROP TABLE "Media";
ALTER TABLE "new_Media" RENAME TO "Media";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Contribution_type_idx" ON "Contribution"("type");

-- CreateIndex
CREATE INDEX "Contribution_startDate_idx" ON "Contribution"("startDate");

-- CreateIndex
CREATE INDEX "RecommendedBook_priority_idx" ON "RecommendedBook"("priority");

-- CreateIndex
CREATE INDEX "RecommendedBook_title_idx" ON "RecommendedBook"("title");
