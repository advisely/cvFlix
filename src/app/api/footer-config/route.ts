import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    let footerConfig = await prisma.footerConfig.findFirst();

    // If no config exists, create a default one
    if (!footerConfig) {
      footerConfig = await prisma.footerConfig.create({
        data: {
          logoText: "resumeflex",
          logoImageUrl: null,
          useImageLogo: false,
          copyrightText: "© 2025 resumeflex. All rights reserved.",
          linkedinUrl: null,
          showLinkedin: true,
          backgroundColor: "#0a0a0a",
          textColor: "#ffffff"
        }
      });
    }

    return NextResponse.json(footerConfig);
  } catch (error) {
    console.error('Error fetching footer config:', error);
    return NextResponse.json({ error: 'Failed to fetch footer config', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      logoText,
      logoImageUrl,
      useImageLogo,
      copyrightText,
      linkedinUrl,
      showLinkedin,
      backgroundColor,
      textColor
    } = body;

    // Get existing config or create new one
    let footerConfig = await prisma.footerConfig.findFirst();

    const updateData = {
      ...(logoText !== undefined && { logoText }),
      ...(logoImageUrl !== undefined && { logoImageUrl }),
      ...(useImageLogo !== undefined && { useImageLogo }),
      ...(copyrightText !== undefined && { copyrightText }),
      ...(linkedinUrl !== undefined && { linkedinUrl }),
      ...(showLinkedin !== undefined && { showLinkedin }),
      ...(backgroundColor !== undefined && { backgroundColor }),
      ...(textColor !== undefined && { textColor })
    };

    if (footerConfig) {
      // Update existing config
      footerConfig = await prisma.footerConfig.update({
        where: { id: footerConfig.id },
        data: updateData
      });
    } else {
      // Create new config
      footerConfig = await prisma.footerConfig.create({
        data: {
          logoText: logoText || "resumeflex",
          logoImageUrl: logoImageUrl || null,
          useImageLogo: useImageLogo || false,
          copyrightText: copyrightText || "© 2025 resumeflex. All rights reserved.",
          linkedinUrl: linkedinUrl || null,
          showLinkedin: showLinkedin !== undefined ? showLinkedin : true,
          backgroundColor: backgroundColor || "#0a0a0a",
          textColor: textColor || "#ffffff"
        }
      });
    }

    return NextResponse.json(footerConfig);
  } catch (error) {
    console.error('Error updating footer config:', error);
    return NextResponse.json({ error: 'Failed to update footer config' }, { status: 500 });
  }
}
