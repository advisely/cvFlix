-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_NavbarConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "logoText" TEXT NOT NULL DEFAULT 'resumeFlex',
    "logoImageUrl" TEXT,
    "useImageLogo" BOOLEAN NOT NULL DEFAULT false,
    "workExperienceLabel" TEXT NOT NULL DEFAULT 'Work Experience',
    "careerSeriesLabel" TEXT NOT NULL DEFAULT 'Career Series',
    "educationLabel" TEXT NOT NULL DEFAULT 'Education',
    "certificationsLabel" TEXT NOT NULL DEFAULT 'Certifications',
    "skillsLabel" TEXT NOT NULL DEFAULT 'Skills',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_NavbarConfig" ("careerSeriesLabel", "certificationsLabel", "createdAt", "educationLabel", "id", "skillsLabel", "updatedAt", "workExperienceLabel") SELECT "careerSeriesLabel", "certificationsLabel", "createdAt", "educationLabel", "id", "skillsLabel", "updatedAt", "workExperienceLabel" FROM "NavbarConfig";
DROP TABLE "NavbarConfig";
ALTER TABLE "new_NavbarConfig" RENAME TO "NavbarConfig";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
