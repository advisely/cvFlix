-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FooterConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "logoText" TEXT NOT NULL DEFAULT 'resumeflex',
    "logoImageUrl" TEXT,
    "useImageLogo" BOOLEAN NOT NULL DEFAULT false,
    "copyrightText" TEXT NOT NULL DEFAULT '© 2025 resumeflex. All rights reserved.',
    "linkedinUrl" TEXT,
    "showLinkedin" BOOLEAN NOT NULL DEFAULT true,
    "backgroundColor" TEXT NOT NULL DEFAULT '#0a0a0a',
    "textColor" TEXT NOT NULL DEFAULT '#ffffff',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_FooterConfig" ("backgroundColor", "copyrightText", "createdAt", "id", "linkedinUrl", "logoImageUrl", "logoText", "showLinkedin", "textColor", "updatedAt", "useImageLogo") SELECT "backgroundColor", "copyrightText", "createdAt", "id", "linkedinUrl", "logoImageUrl", "logoText", "showLinkedin", "textColor", "updatedAt", "useImageLogo" FROM "FooterConfig";
DROP TABLE "FooterConfig";
ALTER TABLE "new_FooterConfig" RENAME TO "FooterConfig";
CREATE TABLE "new_Media" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "experienceId" TEXT,
    "experienceHomepageId" TEXT,
    "experienceCardId" TEXT,
    "educationId" TEXT,
    "skillId" TEXT,
    "certificationId" TEXT,
    "highlightId" TEXT,
    "highlightHomepageId" TEXT,
    "highlightCardId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Media_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES "Experience" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Media_experienceHomepageId_fkey" FOREIGN KEY ("experienceHomepageId") REFERENCES "Experience" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Media_experienceCardId_fkey" FOREIGN KEY ("experienceCardId") REFERENCES "Experience" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Media_educationId_fkey" FOREIGN KEY ("educationId") REFERENCES "Education" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Media_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Media_certificationId_fkey" FOREIGN KEY ("certificationId") REFERENCES "Certification" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Media_highlightId_fkey" FOREIGN KEY ("highlightId") REFERENCES "Highlight" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Media_highlightHomepageId_fkey" FOREIGN KEY ("highlightHomepageId") REFERENCES "Highlight" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Media_highlightCardId_fkey" FOREIGN KEY ("highlightCardId") REFERENCES "Highlight" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Media" ("certificationId", "createdAt", "educationId", "experienceId", "highlightCardId", "highlightHomepageId", "highlightId", "id", "skillId", "type", "url") SELECT "certificationId", "createdAt", "educationId", "experienceId", "highlightCardId", "highlightHomepageId", "highlightId", "id", "skillId", "type", "url" FROM "Media";
DROP TABLE "Media";
ALTER TABLE "new_Media" RENAME TO "Media";
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_NavbarConfig" ("backgroundColor", "backgroundImageUrl", "backgroundType", "careerSeriesLabel", "certificationsLabel", "createdAt", "educationLabel", "fontFamily", "gradientFrom", "gradientTo", "id", "logoImageUrl", "logoText", "skillsLabel", "updatedAt", "useImageLogo", "workExperienceLabel") SELECT "backgroundColor", "backgroundImageUrl", "backgroundType", "careerSeriesLabel", "certificationsLabel", "createdAt", "educationLabel", "fontFamily", "gradientFrom", "gradientTo", "id", "logoImageUrl", "logoText", "skillsLabel", "updatedAt", "useImageLogo", "workExperienceLabel" FROM "NavbarConfig";
DROP TABLE "NavbarConfig";
ALTER TABLE "new_NavbarConfig" RENAME TO "NavbarConfig";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
