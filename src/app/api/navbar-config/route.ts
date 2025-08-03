import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    let navbarConfig = await prisma.navbarConfig.findFirst();

    // If no config exists, create a default one
    if (!navbarConfig) {
      navbarConfig = await prisma.navbarConfig.create({
        data: {
          logoText: "cvFlix",
          logoImageUrl: null,
          useImageLogo: false,
          workExperienceLabel: "Work Experience",
          careerSeriesLabel: "Career Series",
          educationLabel: "Education",
          certificationsLabel: "Certifications",
          skillsLabel: "Skills",
          backgroundColor: "#141414",
          backgroundType: "color",
          backgroundImageUrl: null,
          gradientFrom: "#141414",
          gradientTo: "#1a1a1a",
          fontFamily: "Inter"
        }
      });
    }

    return NextResponse.json(navbarConfig);
  } catch (error) {
    console.error('Error fetching navbar config:', error);
    return NextResponse.json({ error: 'Failed to fetch navbar config' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      logoText,
      logoImageUrl,
      useImageLogo,
      workExperienceLabel,
      careerSeriesLabel,
      educationLabel,
      certificationsLabel,
      skillsLabel,
      backgroundColor,
      backgroundType,
      backgroundImageUrl,
      gradientFrom,
      gradientTo,
      fontFamily
    } = body;

    // Get existing config or create new one
    let navbarConfig = await prisma.navbarConfig.findFirst();

    const updateData = {
      workExperienceLabel,
      careerSeriesLabel,
      educationLabel,
      certificationsLabel,
      skillsLabel,
      ...(logoText !== undefined && { logoText }),
      ...(logoImageUrl !== undefined && { logoImageUrl }),
      ...(useImageLogo !== undefined && { useImageLogo }),
      ...(backgroundColor !== undefined && { backgroundColor }),
      ...(backgroundType !== undefined && { backgroundType }),
      ...(backgroundImageUrl !== undefined && { backgroundImageUrl }),
      ...(gradientFrom !== undefined && { gradientFrom }),
      ...(gradientTo !== undefined && { gradientTo }),
      ...(fontFamily !== undefined && { fontFamily })
    };

    if (navbarConfig) {
      // Update existing config
      navbarConfig = await prisma.navbarConfig.update({
        where: { id: navbarConfig.id },
        data: updateData
      });
    } else {
      // Create new config
      navbarConfig = await prisma.navbarConfig.create({
        data: {
          logoText: logoText || "cvFlix",
          logoImageUrl: logoImageUrl || null,
          useImageLogo: useImageLogo || false,
          workExperienceLabel,
          careerSeriesLabel,
          educationLabel,
          certificationsLabel,
          skillsLabel,
          backgroundColor: backgroundColor || "#141414",
          backgroundType: backgroundType || "color",
          backgroundImageUrl: backgroundImageUrl || null,
          gradientFrom: gradientFrom || "#141414",
          gradientTo: gradientTo || "#1a1a1a",
          fontFamily: fontFamily || "Inter"
        }
      });
    }

    return NextResponse.json(navbarConfig);
  } catch (error) {
    console.error('Error updating navbar config:', error);
    return NextResponse.json({ error: 'Failed to update navbar config' }, { status: 500 });
  }
}
