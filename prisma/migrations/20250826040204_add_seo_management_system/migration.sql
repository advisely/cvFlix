-- CreateTable
CREATE TABLE "SEOConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "siteName" TEXT NOT NULL DEFAULT 'resumeflex',
    "siteNameFr" TEXT NOT NULL DEFAULT 'resumeflex',
    "defaultTitle" TEXT NOT NULL DEFAULT 'Professional Portfolio - resumeflex',
    "defaultTitleFr" TEXT NOT NULL DEFAULT 'Portfolio Professionnel - resumeflex',
    "defaultDescription" TEXT NOT NULL DEFAULT 'Professional portfolio showcasing experience, skills, and achievements.',
    "defaultDescriptionFr" TEXT NOT NULL DEFAULT 'Portfolio professionnel présentant l''expérience, les compétences et les réalisations.',
    "defaultKeywords" TEXT NOT NULL DEFAULT 'portfolio, professional, experience, skills, career',
    "defaultKeywordsFr" TEXT NOT NULL DEFAULT 'portfolio, professionnel, expérience, compétences, carrière',
    "canonicalUrl" TEXT NOT NULL DEFAULT 'https://resumeflex.com',
    "robotsContent" TEXT NOT NULL DEFAULT 'User-agent: *
Allow: /
Disallow: /boss/
Sitemap: https://resumeflex.com/sitemap.xml',
    "faviconUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SEOMetaTag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "page" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleFr" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "descriptionFr" TEXT NOT NULL,
    "keywords" TEXT,
    "keywordsFr" TEXT,
    "ogTitle" TEXT,
    "ogTitleFr" TEXT,
    "ogDescription" TEXT,
    "ogDescriptionFr" TEXT,
    "ogImage" TEXT,
    "canonicalUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "StructuredData" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "page" TEXT NOT NULL,
    "jsonData" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "SEOMetaTag_page_key" ON "SEOMetaTag"("page");

-- CreateIndex
CREATE INDEX "SEOMetaTag_page_idx" ON "SEOMetaTag"("page");

-- CreateIndex
CREATE INDEX "StructuredData_type_idx" ON "StructuredData"("type");

-- CreateIndex
CREATE INDEX "StructuredData_page_idx" ON "StructuredData"("page");

-- CreateIndex
CREATE INDEX "StructuredData_isActive_idx" ON "StructuredData"("isActive");
