-- CreateTable
CREATE TABLE "FooterConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "logoText" TEXT NOT NULL DEFAULT 'resumeFlex',
    "logoImageUrl" TEXT,
    "useImageLogo" BOOLEAN NOT NULL DEFAULT false,
    "copyrightText" TEXT NOT NULL DEFAULT '© 2025 resumeFlex. All rights reserved.',
    "linkedinUrl" TEXT,
    "showLinkedin" BOOLEAN NOT NULL DEFAULT true,
    "backgroundColor" TEXT NOT NULL DEFAULT '#0a0a0a',
    "textColor" TEXT NOT NULL DEFAULT '#ffffff',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
