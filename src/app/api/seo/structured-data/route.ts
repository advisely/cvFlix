import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { StructuredDataCreateRequest, StructuredDataUpdateRequest } from '@/types/seo';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page');
    const type = searchParams.get('type');
    const isActiveParam = searchParams.get('isActive');

    const whereClause: Record<string, unknown> = {};

    if (page) {
      whereClause.page = page;
    }

    if (type) {
      whereClause.type = type;
    }

    if (isActiveParam !== null) {
      whereClause.isActive = isActiveParam === 'true';
    }

    const structuredData = await prisma.structuredData.findMany({
      where: whereClause,
      orderBy: [
        { page: 'asc' },
        { type: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json(structuredData);
  } catch (error) {
    console.error('Error fetching structured data:', error);
    return NextResponse.json({ error: 'Failed to fetch structured data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: StructuredDataCreateRequest = await request.json();
    const { type, page, jsonData, isActive } = body;

    // Validate required fields
    if (!type || !page || !jsonData) {
      return NextResponse.json(
        { error: 'Required fields: type, page, jsonData' },
        { status: 400 }
      );
    }

    // Validate page format (should start with /)
    if (!page.startsWith('/')) {
      return NextResponse.json(
        { error: 'Page path should start with /' },
        { status: 400 }
      );
    }

    // Validate JSON structure
    let parsedJson;
    try {
      parsedJson = JSON.parse(jsonData);
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON format in jsonData field' },
        { status: 400 }
      );
    }

    // Validate required JSON-LD fields
    if (!parsedJson['@context'] || !parsedJson['@type']) {
      return NextResponse.json(
        { error: 'JSON-LD data must include @context and @type fields' },
        { status: 400 }
      );
    }

    // Validate @context is schema.org
    if (!parsedJson['@context'].includes('schema.org')) {
      return NextResponse.json(
        { error: '@context should reference schema.org' },
        { status: 400 }
      );
    }

    // Basic sanitization - prevent script injection in JSON
    if (jsonData.toLowerCase().includes('<script') || jsonData.toLowerCase().includes('javascript:')) {
      return NextResponse.json(
        { error: 'Invalid content detected in structured data' },
        { status: 400 }
      );
    }

    const structuredDataRecord = await prisma.structuredData.create({
      data: {
        type,
        page,
        jsonData,
        isActive: isActive !== undefined ? isActive : true
      }
    });

    return NextResponse.json(structuredDataRecord);
  } catch (error) {
    console.error('Error creating structured data:', error);
    return NextResponse.json({ error: 'Failed to create structured data' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID parameter is required' }, { status: 400 });
    }

    const body: StructuredDataUpdateRequest = await request.json();
    const { type, page, jsonData, isActive } = body;

    // Check if record exists
    const existingRecord = await prisma.structuredData.findUnique({
      where: { id }
    });

    if (!existingRecord) {
      return NextResponse.json(
        { error: 'Structured data record not found' },
        { status: 404 }
      );
    }

    // Validate page format if provided
    if (page && !page.startsWith('/')) {
      return NextResponse.json(
        { error: 'Page path should start with /' },
        { status: 400 }
      );
    }

    // Validate JSON structure if provided
    if (jsonData) {
      let parsedJson;
      try {
        parsedJson = JSON.parse(jsonData);
      } catch {
        return NextResponse.json(
          { error: 'Invalid JSON format in jsonData field' },
          { status: 400 }
        );
      }

      // Validate required JSON-LD fields
      if (!parsedJson['@context'] || !parsedJson['@type']) {
        return NextResponse.json(
          { error: 'JSON-LD data must include @context and @type fields' },
          { status: 400 }
        );
      }

      // Validate @context is schema.org
      if (!parsedJson['@context'].includes('schema.org')) {
        return NextResponse.json(
          { error: '@context should reference schema.org' },
          { status: 400 }
        );
      }

      // Basic sanitization - prevent script injection in JSON
      if (jsonData.toLowerCase().includes('<script') || jsonData.toLowerCase().includes('javascript:')) {
        return NextResponse.json(
          { error: 'Invalid content detected in structured data' },
          { status: 400 }
        );
      }
    }

    const updateData = {
      ...(type !== undefined && { type }),
      ...(page !== undefined && { page }),
      ...(jsonData !== undefined && { jsonData }),
      ...(isActive !== undefined && { isActive })
    };

    const structuredDataRecord = await prisma.structuredData.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(structuredDataRecord);
  } catch (error) {
    console.error('Error updating structured data:', error);
    return NextResponse.json({ error: 'Failed to update structured data' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID parameter is required' }, { status: 400 });
    }

    // Check if record exists
    const existingRecord = await prisma.structuredData.findUnique({
      where: { id }
    });

    if (!existingRecord) {
      return NextResponse.json(
        { error: 'Structured data record not found' },
        { status: 404 }
      );
    }

    await prisma.structuredData.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Structured data deleted successfully' });
  } catch (error) {
    console.error('Error deleting structured data:', error);
    return NextResponse.json({ error: 'Failed to delete structured data' }, { status: 500 });
  }
}
