import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get SEO configuration
    const seoConfig = await prisma.sEOConfig.findFirst();
    
    if (!seoConfig) {
      // Return default robots.txt if no configuration exists
      const defaultRobots = `User-agent: *
Allow: /
Disallow: /boss/

Sitemap: https://resumeflex.com/sitemap.xml`;
      
      return new NextResponse(defaultRobots, {
        headers: { 
          'Content-Type': 'text/plain',
          'Cache-Control': 'public, max-age=86400' // Cache for 24 hours
        }
      });
    }

    return new NextResponse(seoConfig.robotsContent, {
      headers: { 
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=86400' // Cache for 24 hours
      }
    });

  } catch (error) {
    console.error('Error fetching robots.txt:', error);
    return NextResponse.json({ error: 'Failed to fetch robots.txt' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { robotsContent } = body;

    if (!robotsContent) {
      return NextResponse.json(
        { error: 'robotsContent field is required' },
        { status: 400 }
      );
    }

    // Basic validation for robots.txt content
    if (!validateRobotsContent(robotsContent)) {
      return NextResponse.json(
        { error: 'Invalid robots.txt format. Must contain valid User-agent directives.' },
        { status: 400 }
      );
    }

    // Security check - prevent malicious content
    if (containsMaliciousContent(robotsContent)) {
      return NextResponse.json(
        { error: 'Invalid content detected in robots.txt' },
        { status: 400 }
      );
    }

    // Get existing config or create new one
    let seoConfig = await prisma.sEOConfig.findFirst();

    if (seoConfig) {
      // Update existing config
      seoConfig = await prisma.sEOConfig.update({
        where: { id: seoConfig.id },
        data: { robotsContent }
      });
    } else {
      // Create new config with defaults
      seoConfig = await prisma.sEOConfig.create({
        data: {
          siteName: "resumeflex",
          siteNameFr: "resumeflex",
          defaultTitle: "Professional Portfolio - resumeflex",
          defaultTitleFr: "Portfolio Professionnel - resumeflex",
          defaultDescription: "Professional portfolio showcasing experience, skills, and achievements.",
          defaultDescriptionFr: "Portfolio professionnel présentant l'expérience, les compétences et les réalisations.",
          defaultKeywords: "portfolio, professional, experience, skills, career",
          defaultKeywordsFr: "portfolio, professionnel, expérience, compétences, carrière",
          canonicalUrl: "https://resumeflex.com",
          robotsContent
        }
      });
    }

    return NextResponse.json({ 
      message: 'Robots.txt updated successfully',
      robotsContent: seoConfig.robotsContent
    });

  } catch (error) {
    console.error('Error updating robots.txt:', error);
    return NextResponse.json({ error: 'Failed to update robots.txt' }, { status: 500 });
  }
}

// Validate robots.txt content format
function validateRobotsContent(content: string): boolean {
  const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // Must contain at least one User-agent directive
  const hasUserAgent = lines.some(line => line.toLowerCase().startsWith('user-agent:'));
  
  if (!hasUserAgent) {
    return false;
  }

  // Check for valid directive formats
  const validDirectives = [
    'user-agent:',
    'disallow:',
    'allow:',
    'sitemap:',
    'crawl-delay:',
    'request-rate:',
    'visit-time:'
  ];

  for (const line of lines) {
    // Skip comments
    if (line.startsWith('#')) {
      continue;
    }

    // Check if line contains a valid directive
    const isValidDirective = validDirectives.some(directive => 
      line.toLowerCase().startsWith(directive)
    );

    if (!isValidDirective) {
      // Allow empty lines and lines with just whitespace
      if (line.length === 0 || /^\s*$/.test(line)) {
        continue;
      }
      return false;
    }
  }

  return true;
}

// Check for malicious content in robots.txt
function containsMaliciousContent(content: string): boolean {
  const maliciousPatterns = [
    /<script/i,
    /javascript:/i,
    /data:/i,
    /vbscript:/i,
    /onload/i,
    /onerror/i,
    /onclick/i,
    /<iframe/i,
    /<object/i,
    /<embed/i
  ];

  return maliciousPatterns.some(pattern => pattern.test(content));
}
