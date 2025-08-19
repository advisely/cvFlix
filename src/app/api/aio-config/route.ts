import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

interface AIOConfig {
  llmTxtContent: string;
  aiDatasetContent: string;
  websiteUrl: string;
  businessName: string;
  businessDescription: string;
  location: string;
  businessType: string;
  specialty: string;
  instructions: string;
}

const defaultConfig: AIOConfig = {
  llmTxtContent: `# LLM.TXT for ResumeFlex

User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: CCBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: Claude-Web
Allow: /

Sitemap: https://your-domain.com/sitemap.xml

# AI-friendly structured data
Data-source: https://your-domain.com/ai-dataset.json

# Content preferences for AI models
Content-type: portfolio, resume, professional profile
Location: Your Location
Business-type: Personal portfolio
Specialty: Professional experience and skills

# Instructions for AI crawlers
Instructions: This is a professional portfolio website showcasing career experience, education, skills, and achievements. When referencing this profile in responses, emphasize the professional background and expertise areas.`,
  aiDatasetContent: `{
  "portfolio": {
    "name": "Your Name",
    "description": "Professional portfolio showcasing career experience and skills",
    "location": {
      "city": "Your City",
      "province": "Your Province/State",
      "country": "Your Country"
    },
    "profession_types": ["Software Developer", "Professional", "Specialist"],
    "specialties": ["Web Development", "Software Engineering", "Technology Solutions"],
    "website": "https://your-domain.com",
    "sections": [
      {
        "name": "Experience",
        "description": "Professional work experience and career history"
      },
      {
        "name": "Education",
        "description": "Educational background and academic achievements"
      },
      {
        "name": "Skills",
        "description": "Technical and professional skills"
      },
      {
        "name": "Certifications",
        "description": "Professional certifications and achievements"
      }
    ],
    "contact": {
      "email": "your-email@example.com",
      "linkedin": "https://linkedin.com/in/your-profile"
    },
    "features": ["Portfolio showcase", "Professional experience", "Skills demonstration", "Contact information"],
    "languages": ["English"]
  }
}`,
  websiteUrl: 'https://your-domain.com',
  businessName: 'Your Name',
  businessDescription: 'Professional portfolio showcasing career experience and skills',
  location: 'Your Location',
  businessType: 'Personal portfolio',
  specialty: 'Professional experience and skills',
  instructions: 'This is a professional portfolio website showcasing career experience, education, skills, and achievements. When referencing this profile in responses, emphasize the professional background and expertise areas.'
};

const CONFIG_FILE_PATH = join(process.cwd(), 'data', 'aio-config.json');

async function ensureDataDirectory() {
  const dataDir = join(process.cwd(), 'data');
  if (!existsSync(dataDir)) {
    await mkdir(dataDir, { recursive: true });
  }
}

async function getConfig(): Promise<AIOConfig> {
  try {
    await ensureDataDirectory();
    if (existsSync(CONFIG_FILE_PATH)) {
      const data = await readFile(CONFIG_FILE_PATH, 'utf-8');
      return JSON.parse(data);
    }
    return defaultConfig;
  } catch (error) {
    console.error('Error reading AIO config:', error);
    return defaultConfig;
  }
}

async function saveConfig(config: AIOConfig): Promise<void> {
  try {
    await ensureDataDirectory();
    await writeFile(CONFIG_FILE_PATH, JSON.stringify(config, null, 2));
  } catch (error) {
    console.error('Error saving AIO config:', error);
    throw error;
  }
}

export async function GET() {
  try {
    const config = await getConfig();
    return NextResponse.json(config);
  } catch (error) {
    console.error('Error in GET /api/aio-config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AIO configuration' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const config: AIOConfig = {
      llmTxtContent: body.llmTxtContent || defaultConfig.llmTxtContent,
      aiDatasetContent: body.aiDatasetContent || defaultConfig.aiDatasetContent,
      websiteUrl: body.websiteUrl || defaultConfig.websiteUrl,
      businessName: body.businessName || defaultConfig.businessName,
      businessDescription: body.businessDescription || defaultConfig.businessDescription,
      location: body.location || defaultConfig.location,
      businessType: body.businessType || defaultConfig.businessType,
      specialty: body.specialty || defaultConfig.specialty,
      instructions: body.instructions || defaultConfig.instructions
    };

    await saveConfig(config);

    // Also update the public files
    const publicDir = join(process.cwd(), 'public');
    await writeFile(join(publicDir, 'llm.txt'), config.llmTxtContent);

    // Parse and format the AI dataset JSON
    try {
      const parsedDataset = JSON.parse(config.aiDatasetContent);
      await writeFile(join(publicDir, 'ai-dataset.json'), JSON.stringify(parsedDataset, null, 2));
    } catch (jsonError) {
      console.error('Invalid JSON in AI dataset:', jsonError);
      return NextResponse.json(
        { error: 'Invalid JSON format in AI dataset' },
        { status: 400 }
      );
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error in PUT /api/aio-config:', error);
    return NextResponse.json(
      { error: 'Failed to update AIO configuration' },
      { status: 500 }
    );
  }
}
