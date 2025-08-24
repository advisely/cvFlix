/*
  Warnings:

  - Added the required column `descriptionFr` to the `Accomplishment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `issuerFr` to the `Certification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nameFr` to the `Certification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nameFr` to the `Company` table without a default value. This is not possible if the table is not empty.
  - Added the required column `degreeFr` to the `Education` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fieldFr` to the `Education` table without a default value. This is not possible if the table is not empty.
  - Added the required column `institutionFr` to the `Education` table without a default value. This is not possible if the table is not empty.
  - Added the required column `descriptionFr` to the `Experience` table without a default value. This is not possible if the table is not empty.
  - Added the required column `titleFr` to the `Experience` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyFr` to the `Highlight` table without a default value. This is not possible if the table is not empty.
  - Added the required column `titleFr` to the `Highlight` table without a default value. This is not possible if the table is not empty.
  - Added the required column `descriptionFr` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nameFr` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `categoryFr` to the `Skill` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nameFr` to the `Skill` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Accomplishment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "description" TEXT NOT NULL,
    "descriptionFr" TEXT NOT NULL,
    "experienceId" TEXT NOT NULL,
    CONSTRAINT "Accomplishment_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES "Experience" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Accomplishment" ("description", "experienceId", "id") SELECT "description", "experienceId", "id" FROM "Accomplishment";
DROP TABLE "Accomplishment";
ALTER TABLE "new_Accomplishment" RENAME TO "Accomplishment";
CREATE TABLE "new_Certification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "nameFr" TEXT NOT NULL,
    "issuer" TEXT NOT NULL,
    "issuerFr" TEXT NOT NULL,
    "issueDate" DATETIME NOT NULL
);
INSERT INTO "new_Certification" ("id", "issueDate", "issuer", "name") SELECT "id", "issueDate", "issuer", "name" FROM "Certification";
DROP TABLE "Certification";
ALTER TABLE "new_Certification" RENAME TO "Certification";
CREATE TABLE "new_Company" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "nameFr" TEXT NOT NULL,
    "logoUrl" TEXT
);
INSERT INTO "new_Company" ("id", "logoUrl", "name") SELECT "id", "logoUrl", "name" FROM "Company";
DROP TABLE "Company";
ALTER TABLE "new_Company" RENAME TO "Company";
CREATE UNIQUE INDEX "Company_name_key" ON "Company"("name");
CREATE TABLE "new_Education" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "institution" TEXT NOT NULL,
    "institutionFr" TEXT NOT NULL,
    "degree" TEXT NOT NULL,
    "degreeFr" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "fieldFr" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME
);
INSERT INTO "new_Education" ("degree", "endDate", "field", "id", "institution", "startDate") SELECT "degree", "endDate", "field", "id", "institution", "startDate" FROM "Education";
DROP TABLE "Education";
ALTER TABLE "new_Education" RENAME TO "Education";
CREATE TABLE "new_Experience" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "titleFr" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "description" TEXT NOT NULL,
    "descriptionFr" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    CONSTRAINT "Experience_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Experience" ("companyId", "description", "endDate", "id", "startDate", "title") SELECT "companyId", "description", "endDate", "id", "startDate", "title" FROM "Experience";
DROP TABLE "Experience";
ALTER TABLE "new_Experience" RENAME TO "Experience";
CREATE TABLE "new_FooterConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "logoText" TEXT NOT NULL DEFAULT 'resumeflex',
    "logoTextFr" TEXT NOT NULL DEFAULT 'resumeflex',
    "logoImageUrl" TEXT,
    "useImageLogo" BOOLEAN NOT NULL DEFAULT false,
    "copyrightText" TEXT NOT NULL DEFAULT '© 2025 resumeflex. All rights reserved.',
    "copyrightTextFr" TEXT NOT NULL DEFAULT '© 2025 resumeflex. Tous droits réservés.',
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
CREATE TABLE "new_Highlight" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "titleFr" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "companyFr" TEXT NOT NULL,
    "description" TEXT,
    "descriptionFr" TEXT,
    "startDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Highlight" ("company", "createdAt", "description", "id", "startDate", "title") SELECT "company", "createdAt", "description", "id", "startDate", "title" FROM "Highlight";
DROP TABLE "Highlight";
ALTER TABLE "new_Highlight" RENAME TO "Highlight";
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
    "educationLabel" TEXT NOT NULL DEFAULT 'Education',
    "educationLabelFr" TEXT NOT NULL DEFAULT 'Éducation',
    "certificationsLabel" TEXT NOT NULL DEFAULT 'Certifications',
    "certificationsLabelFr" TEXT NOT NULL DEFAULT 'Certifications',
    "skillsLabel" TEXT NOT NULL DEFAULT 'Skills',
    "skillsLabelFr" TEXT NOT NULL DEFAULT 'Compétences',
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
INSERT INTO "new_NavbarConfig" ("backgroundColor", "backgroundImageUrl", "backgroundType", "careerSeriesLabel", "certificationsLabel", "createdAt", "educationLabel", "fontFamily", "gradientFrom", "gradientTo", "id", "logoFontFamily", "logoImageUrl", "logoText", "skillsLabel", "updatedAt", "useImageLogo", "workExperienceLabel") SELECT "backgroundColor", "backgroundImageUrl", "backgroundType", "careerSeriesLabel", "certificationsLabel", "createdAt", "educationLabel", "fontFamily", "gradientFrom", "gradientTo", "id", "logoFontFamily", "logoImageUrl", "logoText", "skillsLabel", "updatedAt", "useImageLogo", "workExperienceLabel" FROM "NavbarConfig";
DROP TABLE "NavbarConfig";
ALTER TABLE "new_NavbarConfig" RENAME TO "NavbarConfig";
CREATE TABLE "new_Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "nameFr" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "descriptionFr" TEXT NOT NULL,
    "url" TEXT,
    "experienceId" TEXT NOT NULL,
    CONSTRAINT "Project_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES "Experience" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Project" ("description", "experienceId", "id", "name", "url") SELECT "description", "experienceId", "id", "name", "url" FROM "Project";
DROP TABLE "Project";
ALTER TABLE "new_Project" RENAME TO "Project";
CREATE TABLE "new_Skill" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "nameFr" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "categoryFr" TEXT NOT NULL
);
INSERT INTO "new_Skill" ("category", "id", "name") SELECT "category", "id", "name" FROM "Skill";
DROP TABLE "Skill";
ALTER TABLE "new_Skill" RENAME TO "Skill";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
