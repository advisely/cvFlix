import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PersonSchema, OrganizationSchema, WebSiteSchema } from '@/types/seo';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type) {
      const template = getTemplateByType(type);
      if (!template) {
        return NextResponse.json({ error: 'Template not found' }, { status: 404 });
      }
      return NextResponse.json(template);
    }

    // Return all available templates
    const templates = {
      Person: getPersonTemplate(),
      Organization: getOrganizationTemplate(),
      WebSite: getWebSiteTemplate(),
      BreadcrumbList: getBreadcrumbTemplate(),
      JobPosting: getJobPostingTemplate(),
      Article: getArticleTemplate(),
      VideoObject: getVideoObjectTemplate(),
      ImageObject: getImageObjectTemplate()
    };

    return NextResponse.json({
      templates,
      availableTypes: Object.keys(templates),
      message: 'Available structured data templates'
    });

  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { type, customData, page } = await request.json();

    if (!type) {
      return NextResponse.json({ error: 'Template type is required' }, { status: 400 });
    }

    // Get base template
    const template = getTemplateByType(type);
    if (!template) {
      return NextResponse.json({ error: 'Invalid template type' }, { status: 400 });
    }

    // Merge with custom data if provided
    const mergedTemplate = customData ? { ...template, ...customData } : template;

    // If page is provided, create the structured data record
    if (page) {
      const structuredData = await prisma.structuredData.create({
        data: {
          type,
          page,
          jsonData: JSON.stringify(mergedTemplate, null, 2),
          isActive: true
        }
      });

      return NextResponse.json({
        success: true,
        template: mergedTemplate,
        structuredData,
        message: 'Template applied and structured data created'
      });
    }

    return NextResponse.json({
      success: true,
      template: mergedTemplate,
      message: 'Template generated successfully'
    });

  } catch (error) {
    console.error('Error applying template:', error);
    return NextResponse.json({ error: 'Failed to apply template' }, { status: 500 });
  }
}

function getTemplateByType(type: string): Record<string, unknown> | null {
  switch (type) {
    case 'Person':
      return getPersonTemplate();
    case 'Organization':
      return getOrganizationTemplate();
    case 'WebSite':
      return getWebSiteTemplate();
    case 'BreadcrumbList':
      return getBreadcrumbTemplate();
    case 'JobPosting':
      return getJobPostingTemplate();
    case 'Article':
      return getArticleTemplate();
    case 'VideoObject':
      return getVideoObjectTemplate();
    case 'ImageObject':
      return getImageObjectTemplate();
    default:
      return null;
  }
}

function getPersonTemplate(): PersonSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Your Full Name',
    jobTitle: 'Your Job Title',
    url: 'https://resumeflex.com',
    sameAs: [
      'https://linkedin.com/in/yourprofile',
      'https://github.com/yourprofile'
    ],
    worksFor: {
      '@type': 'Organization',
      name: 'Your Current Company'
    }
  };
}

function getOrganizationTemplate(): OrganizationSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Your Organization Name',
    url: 'https://resumeflex.com',
    logo: 'https://resumeflex.com/logo.png',
    sameAs: [
      'https://linkedin.com/company/yourcompany'
    ]
  };
}

function getWebSiteTemplate(): WebSiteSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Professional Portfolio - resumeflex',
    url: 'https://resumeflex.com',
    description: 'Professional portfolio showcasing experience, skills, and achievements.',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://resumeflex.com/search?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  };
}

function getBreadcrumbTemplate() {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://resumeflex.com'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Current Page',
        item: 'https://resumeflex.com/current-page'
      }
    ]
  };
}

function getJobPostingTemplate() {
  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: 'Job Title',
    description: 'Job description and requirements',
    hiringOrganization: {
      '@type': 'Organization',
      name: 'Company Name',
      sameAs: 'https://company-website.com'
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Street Address',
        addressLocality: 'City',
        addressRegion: 'State',
        postalCode: 'ZIP',
        addressCountry: 'Country'
      }
    },
    datePosted: new Date().toISOString().split('T')[0],
    employmentType: 'FULL_TIME',
    baseSalary: {
      '@type': 'MonetaryAmount',
      currency: 'USD',
      value: {
        '@type': 'QuantitativeValue',
        value: 50000,
        unitText: 'YEAR'
      }
    }
  };
}

function getArticleTemplate() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Article Headline',
    description: 'Article description',
    author: {
      '@type': 'Person',
      name: 'Author Name'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Publisher Name',
      logo: {
        '@type': 'ImageObject',
        url: 'https://resumeflex.com/logo.png'
      }
    },
    datePublished: new Date().toISOString().split('T')[0],
    dateModified: new Date().toISOString().split('T')[0],
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': 'https://resumeflex.com/article'
    }
  };
}

function getVideoObjectTemplate() {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: 'Video Title',
    description: 'Video description',
    thumbnailUrl: 'https://resumeflex.com/video-thumbnail.jpg',
    uploadDate: new Date().toISOString().split('T')[0],
    duration: 'PT5M30S', // 5 minutes 30 seconds in ISO 8601 format
    contentUrl: 'https://resumeflex.com/video.mp4',
    embedUrl: 'https://resumeflex.com/video-embed',
    author: {
      '@type': 'Person',
      name: 'Video Author'
    }
  };
}

function getImageObjectTemplate() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    contentUrl: 'https://resumeflex.com/image.jpg',
    license: 'https://creativecommons.org/licenses/by/4.0/',
    acquireLicensePage: 'https://resumeflex.com/license',
    creditText: 'Image Credit',
    creator: {
      '@type': 'Person',
      name: 'Image Creator'
    },
    copyrightNotice: '© 2025 resumeflex'
  };
}
