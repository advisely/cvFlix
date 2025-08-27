import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedSEOData() {
  console.log('Starting SEO data seeding...');

  try {
    // Create default SEO configuration
    const seoConfig = await prisma.sEOConfig.upsert({
      where: { id: 'seo_config_default' },
      update: {},
      create: {
        id: 'seo_config_default',
        siteName: 'resumeflex',
        siteNameFr: 'resumeflex',
        defaultTitle: 'Professional Portfolio - resumeflex',
        defaultTitleFr: 'Portfolio Professionnel - resumeflex',
        defaultDescription: 'Professional portfolio showcasing experience, skills, and achievements in technology and leadership.',
        defaultDescriptionFr: 'Portfolio professionnel présentant l\'expérience, les compétences et les réalisations en technologie et leadership.',
        defaultKeywords: 'portfolio, professional, experience, skills, career, technology, leadership',
        defaultKeywordsFr: 'portfolio, professionnel, expérience, compétences, carrière, technologie, leadership',
        canonicalUrl: 'https://resumeflex.com',
        robotsContent: `User-agent: *
Allow: /
Disallow: /boss/
Disallow: /api/

Sitemap: https://resumeflex.com/sitemap.xml`
      }
    });

    console.log('✅ Created default SEO configuration');

    // Create meta tags for main pages
    const mainPages = [
      {
        page: '/',
        title: 'Professional Portfolio - resumeflex',
        titleFr: 'Portfolio Professionnel - resumeflex',
        description: 'Explore my professional journey, technical skills, and career achievements in this comprehensive portfolio.',
        descriptionFr: 'Découvrez mon parcours professionnel, mes compétences techniques et mes réalisations de carrière dans ce portfolio complet.',
        keywords: 'portfolio, professional, resume, career, experience',
        keywordsFr: 'portfolio, professionnel, CV, carrière, expérience',
        ogTitle: 'Professional Portfolio - resumeflex',
        ogTitleFr: 'Portfolio Professionnel - resumeflex',
        ogDescription: 'Comprehensive professional portfolio showcasing technical expertise and career achievements.',
        ogDescriptionFr: 'Portfolio professionnel complet présentant l\'expertise technique et les réalisations de carrière.',
        canonicalUrl: 'https://resumeflex.com/'
      },
      {
        page: '/experiences',
        title: 'Professional Experience - resumeflex',
        titleFr: 'Expérience Professionnelle - resumeflex',
        description: 'Detailed overview of my professional experience, roles, and accomplishments across various organizations.',
        descriptionFr: 'Aperçu détaillé de mon expérience professionnelle, de mes rôles et de mes réalisations dans diverses organisations.',
        keywords: 'work experience, professional roles, career history, achievements',
        keywordsFr: 'expérience de travail, rôles professionnels, historique de carrière, réalisations',
        ogTitle: 'Professional Experience - resumeflex',
        ogTitleFr: 'Expérience Professionnelle - resumeflex',
        ogDescription: 'Professional experience showcasing career progression and key achievements.',
        ogDescriptionFr: 'Expérience professionnelle montrant la progression de carrière et les réalisations clés.',
        canonicalUrl: 'https://resumeflex.com/experiences'
      },
      {
        page: '/education',
        title: 'Education & Qualifications - resumeflex',
        titleFr: 'Formation & Qualifications - resumeflex',
        description: 'Academic background, degrees, and educational achievements that shaped my professional foundation.',
        descriptionFr: 'Formation académique, diplômes et réalisations éducatives qui ont façonné ma base professionnelle.',
        keywords: 'education, degrees, qualifications, academic, learning',
        keywordsFr: 'éducation, diplômes, qualifications, académique, apprentissage',
        ogTitle: 'Education & Qualifications - resumeflex',
        ogTitleFr: 'Formation & Qualifications - resumeflex',
        ogDescription: 'Educational background and qualifications supporting professional expertise.',
        ogDescriptionFr: 'Formation et qualifications soutenant l\'expertise professionnelle.',
        canonicalUrl: 'https://resumeflex.com/education'
      },
      {
        page: '/skills',
        title: 'Technical Skills - resumeflex',
        titleFr: 'Compétences Techniques - resumeflex',
        description: 'Comprehensive overview of technical skills, programming languages, and professional competencies.',
        descriptionFr: 'Aperçu complet des compétences techniques, langages de programmation et compétences professionnelles.',
        keywords: 'technical skills, programming, technologies, competencies, expertise',
        keywordsFr: 'compétences techniques, programmation, technologies, compétences, expertise',
        ogTitle: 'Technical Skills - resumeflex',
        ogTitleFr: 'Compétences Techniques - resumeflex',
        ogDescription: 'Technical skills and expertise across various technologies and domains.',
        ogDescriptionFr: 'Compétences techniques et expertise dans diverses technologies et domaines.',
        canonicalUrl: 'https://resumeflex.com/skills'
      },
      {
        page: '/certifications',
        title: 'Certifications & Awards - resumeflex',
        titleFr: 'Certifications & Prix - resumeflex',
        description: 'Professional certifications, industry recognitions, and awards demonstrating expertise and commitment.',
        descriptionFr: 'Certifications professionnelles, reconnaissances de l\'industrie et prix démontrant l\'expertise et l\'engagement.',
        keywords: 'certifications, awards, professional recognition, industry credentials',
        keywordsFr: 'certifications, prix, reconnaissance professionnelle, accréditations de l\'industrie',
        ogTitle: 'Certifications & Awards - resumeflex',
        ogTitleFr: 'Certifications & Prix - resumeflex',
        ogDescription: 'Professional certifications and recognitions validating technical expertise.',
        ogDescriptionFr: 'Certifications professionnelles et reconnaissances validant l\'expertise technique.',
        canonicalUrl: 'https://resumeflex.com/certifications'
      }
    ];

    for (const page of mainPages) {
      await prisma.sEOMetaTag.upsert({
        where: { page: page.page },
        update: page,
        create: page
      });
    }

    console.log('✅ Created meta tags for main pages');

    // Create structured data for homepage
    const personSchema = {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": "Professional Name",
      "jobTitle": "Senior Technology Professional",
      "url": "https://resumeflex.com",
      "sameAs": [
        "https://linkedin.com/in/yourprofile"
      ],
      "worksFor": {
        "@type": "Organization",
        "name": "Current Organization"
      },
      "knowsAbout": [
        "Software Development",
        "Technology Leadership",
        "Project Management",
        "Team Leadership"
      ]
    };

    await prisma.structuredData.upsert({
      where: { id: 'homepage_person' },
      update: {},
      create: {
        id: 'homepage_person',
        type: 'Person',
        page: '/',
        jsonData: JSON.stringify(personSchema, null, 2),
        isActive: true
      }
    });

    // Create website structured data
    const websiteSchema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "resumeflex - Professional Portfolio",
      "url": "https://resumeflex.com",
      "description": "Professional portfolio showcasing experience, skills, and achievements in technology and leadership.",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://resumeflex.com/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    };

    await prisma.structuredData.upsert({
      where: { id: 'website_schema' },
      update: {},
      create: {
        id: 'website_schema',
        type: 'WebSite',
        page: '/',
        jsonData: JSON.stringify(websiteSchema, null, 2),
        isActive: true
      }
    });

    console.log('✅ Created structured data schemas');
    console.log('🎉 SEO data seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding SEO data:', error);
    throw error;
  }
}

// Run the seeding function
seedSEOData()
  .catch((error) => {
    console.error('❌ SEO seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

export { seedSEOData };
