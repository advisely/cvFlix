-- CreateTable
CREATE TABLE "NavbarConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workExperienceLabel" TEXT NOT NULL DEFAULT 'Work Experience',
    "careerSeriesLabel" TEXT NOT NULL DEFAULT 'Career Series',
    "educationLabel" TEXT NOT NULL DEFAULT 'Education',
    "certificationsLabel" TEXT NOT NULL DEFAULT 'Certifications',
    "skillsLabel" TEXT NOT NULL DEFAULT 'Skills',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
