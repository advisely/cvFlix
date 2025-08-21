-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_NavbarConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "logoText" TEXT NOT NULL DEFAULT 'resumeflex',
    "logoImageUrl" TEXT,
    "useImageLogo" BOOLEAN NOT NULL DEFAULT false,
    "workExperienceLabel" TEXT NOT NULL DEFAULT 'Work Experience',
    "careerSeriesLabel" TEXT NOT NULL DEFAULT 'Career Series',
    "educationLabel" TEXT NOT NULL DEFAULT 'Education',
    "certificationsLabel" TEXT NOT NULL DEFAULT 'Certifications',
    "skillsLabel" TEXT NOT NULL DEFAULT 'Skills',
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
INSERT INTO "new_NavbarConfig" ("backgroundColor", "backgroundImageUrl", "backgroundType", "careerSeriesLabel", "certificationsLabel", "createdAt", "educationLabel", "fontFamily", "gradientFrom", "gradientTo", "id", "logoImageUrl", "logoText", "skillsLabel", "updatedAt", "useImageLogo", "workExperienceLabel") SELECT "backgroundColor", "backgroundImageUrl", "backgroundType", "careerSeriesLabel", "certificationsLabel", "createdAt", "educationLabel", "fontFamily", "gradientFrom", "gradientTo", "id", "logoImageUrl", "logoText", "skillsLabel", "updatedAt", "useImageLogo", "workExperienceLabel" FROM "NavbarConfig";
DROP TABLE "NavbarConfig";
ALTER TABLE "new_NavbarConfig" RENAME TO "NavbarConfig";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
