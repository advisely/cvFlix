import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { page, entityId, entityType, templateType, customData, autoApply } = await request.json();

    if (!page) {
      return NextResponse.json({ error: 'Page is required' }, { status: 400 });
    }

    let generatedData = null;

    // Generate structured data based on context
    if (entityId && entityType) {
      generatedData = await generateFromEntity(entityType, entityId, templateType);
    } else if (templateType) {
      generatedData = await generateFromTemplate(templateType, page);
    } else {
      generatedData = await generateFromPage(page);
    }

    if (!generatedData) {
      return NextResponse.json({ error: 'Could not generate structured data' }, { status: 400 });
    }

    // Merge with custom data if provided
    if (customData) {
      generatedData.data = { ...generatedData.data, ...customData };
    }

    // Auto-apply if requested
    let savedRecord = null;
    if (autoApply) {
      // Check if structured data already exists for this page/type
      const existing = await prisma.structuredData.findFirst({
        where: {
          page,
          type: generatedData.type,
          isActive: true
        }
      });

      if (existing) {
        // Update existing
        savedRecord = await prisma.structuredData.update({
          where: { id: existing.id },
          data: {
            jsonData: JSON.stringify(generatedData.data, null, 2)
          }
        });
      } else {
        // Create new
        savedRecord = await prisma.structuredData.create({
          data: {
            type: generatedData.type,
            page,
            jsonData: JSON.stringify(generatedData.data, null, 2),
            isActive: true
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      generated: generatedData,
      jsonLd: JSON.stringify(generatedData.data, null, 2),
      applied: !!autoApply,
      record: savedRecord
    });

  } catch (error) {
    console.error('Error generating structured data:', error);
    return NextResponse.json({ error: 'Failed to generate structured data' }, { status: 500 });
  }
}

async function generateFromEntity(entityType: string, entityId: string, templateType?: string) {
  try {
    switch (entityType) {
      case 'experience':
        return await generateExperienceStructuredData(entityId, templateType);
      case 'highlight':
        return await generateHighlightStructuredData(entityId, templateType);
      case 'education':
        return await generateEducationStructuredData(entityId, templateType);
      case 'certification':
        return await generateCertificationStructuredData(entityId, templateType);
      default:
        return null;
    }
  } catch (error) {
    console.error(`Error generating structured data for ${entityType}:`, error);
    return null;
  }
}

async function generateFromTemplate(templateType: string, page: string) {
  const seoConfig = await prisma.sEOConfig.findFirst();
  const baseUrl = seoConfig?.canonicalUrl || 'https://resumeflex.com';

  switch (templateType) {
    case 'Person':
      return {
        type: 'Person',
        data: {
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: 'Your Full Name',
          jobTitle: 'Your Job Title',
          url: baseUrl,
          sameAs: [
            'https://linkedin.com/in/yourprofile'
          ]
        }
      };

    case 'WebSite':
      return {
        type: 'WebSite',
        data: {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: seoConfig?.siteName || 'Professional Portfolio',
          url: baseUrl,
          description: seoConfig?.defaultDescription || 'Professional portfolio showcasing experience, skills, and achievements.',
          potentialAction: {
            '@type': 'SearchAction',
            target: `${baseUrl}/search?q={search_term_string}`,
            'query-input': 'required name=search_term_string'
          }
        }
      };

    case 'BreadcrumbList':
      return generateBreadcrumbForPage(page, baseUrl);

    default:
      return null;
  }
}

async function generateFromPage(page: string) {
  const seoConfig = await prisma.sEOConfig.findFirst();
  const baseUrl = seoConfig?.canonicalUrl || 'https://resumeflex.com';

  // Generate appropriate structured data based on page type
  if (page === '/') {
    // Homepage - generate Person + WebSite
    return {
      type: 'WebSite',
      data: {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: seoConfig?.siteName || 'Professional Portfolio',
        url: baseUrl,
        description: seoConfig?.defaultDescription || 'Professional portfolio showcasing experience, skills, and achievements.'
      }
    };
  }

  if (page.startsWith('/experiences')) {
    return generateBreadcrumbForPage(page, baseUrl);
  }

  return null;
}

async function generateExperienceStructuredData(experienceId: string, templateType?: string) {
  const experience = await prisma.experience.findUnique({
    where: { id: experienceId },
    include: {
      company: true,
      accomplishments: true,
      projects: true
    }
  });

  if (!experience) return null;

  const seoConfig = await prisma.sEOConfig.findFirst();
  const baseUrl = seoConfig?.canonicalUrl || 'https://resumeflex.com';

  if (templateType === 'JobPosting') {
    return {
      type: 'JobPosting',
      data: {
        '@context': 'https://schema.org',
        '@type': 'JobPosting',
        title: experience.title,
        description: experience.description,
        hiringOrganization: {
          '@type': 'Organization',
          name: experience.company.name
        },
        datePosted: experience.startDate.toISOString().split('T')[0],
        employmentType: experience.endDate ? 'CONTRACTOR' : 'FULL_TIME',
        url: `${baseUrl}/experiences/${experience.id}`
      }
    };
  }

  // Default to Person schema showing work experience
  return {
    type: 'Person',
    data: {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Professional',
      jobTitle: experience.title,
      worksFor: {
        '@type': 'Organization',
        name: experience.company.name
      },
      description: experience.description,
      url: `${baseUrl}/experiences/${experience.id}`
    }
  };
}

async function generateHighlightStructuredData(highlightId: string, templateType?: string) {
  const highlight = await prisma.highlight.findUnique({
    where: { id: highlightId },
    include: {
      company: true,
      media: true
    }
  });

  if (!highlight) return null;

  const seoConfig = await prisma.sEOConfig.findFirst();
  const baseUrl = seoConfig?.canonicalUrl || 'https://resumeflex.com';

  // Generate Article schema for highlights
  return {
    type: 'Article',
    data: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: highlight.title,
      description: highlight.description || `Professional highlight at ${highlight.company.name}`,
      author: {
        '@type': 'Person',
        name: 'Professional'
      },
      publisher: {
        '@type': 'Organization',
        name: highlight.company.name
      },
      datePublished: highlight.createdAt.toISOString().split('T')[0],
      url: `${baseUrl}/highlights/${highlight.id}`,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `${baseUrl}/highlights/${highlight.id}`
      }
    }
  };
}

async function generateEducationStructuredData(educationId: string, templateType?: string) {
  const education = await prisma.education.findUnique({
    where: { id: educationId }
  });

  if (!education) return null;

  const seoConfig = await prisma.sEOConfig.findFirst();
  const baseUrl = seoConfig?.canonicalUrl || 'https://resumeflex.com';

  return {
    type: 'EducationalOccupationalCredential',
    data: {
      '@context': 'https://schema.org',
      '@type': 'EducationalOccupationalCredential',
      name: `${education.degree} in ${education.field}`,
      description: `${education.degree} degree in ${education.field} from ${education.institution}`,
      credentialCategory: 'Degree',
      recognizedBy: {
        '@type': 'Organization',
        name: education.institution
      },
      dateCreated: education.endDate?.toISOString().split('T')[0] || education.startDate.toISOString().split('T')[0],
      url: `${baseUrl}/education`
    }
  };
}

async function generateCertificationStructuredData(certificationId: string, templateType?: string) {
  const certification = await prisma.certification.findUnique({
    where: { id: certificationId }
  });

  if (!certification) return null;

  const seoConfig = await prisma.sEOConfig.findFirst();
  const baseUrl = seoConfig?.canonicalUrl || 'https://resumeflex.com';

  return {
    type: 'EducationalOccupationalCredential',
    data: {
      '@context': 'https://schema.org',
      '@type': 'EducationalOccupationalCredential',
      name: certification.name,
      description: `Professional certification: ${certification.name}`,
      credentialCategory: 'Certification',
      recognizedBy: {
        '@type': 'Organization',
        name: certification.issuer
      },
      dateCreated: certification.issueDate.toISOString().split('T')[0],
      url: `${baseUrl}/certifications`
    }
  };
}

function generateBreadcrumbForPage(page: string, baseUrl: string) {
  const segments = page.split('/').filter(Boolean);
  const breadcrumbs = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: baseUrl
    }
  ];

  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += '/' + segment;
    let name = segment.charAt(0).toUpperCase() + segment.slice(1);
    
    // Improve segment names
    if (segment === 'experiences') name = 'Work Experience';
    if (segment === 'certifications') name = 'Certifications';
    
    breadcrumbs.push({
      '@type': 'ListItem',
      position: index + 2,
      name,
      item: baseUrl + currentPath
    });
  });

  return {
    type: 'BreadcrumbList',
    data: {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs
    }
  };
}

export async function GET() {
  return NextResponse.json({
    message: 'Structured data generation endpoint',
    supportedEntityTypes: ['experience', 'highlight', 'education', 'certification'],
    supportedTemplateTypes: ['Person', 'WebSite', 'BreadcrumbList', 'JobPosting', 'Article'],
    usage: {
      POST: 'Generate structured data with custom parameters'
    }
  });
}
