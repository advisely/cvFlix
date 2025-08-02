import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Find all media items with blob URLs
    const blobUrls = await prisma.media.findMany({
      where: {
        url: {
          startsWith: 'blob:'
        }
      },
      select: {
        id: true,
        url: true,
        experienceId: true
      }
    });

    return NextResponse.json({ items: blobUrls });
  } catch (error) {
    console.error('Error finding blob URLs:', error);
    return NextResponse.json({ error: 'Failed to find blob URLs' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    // Delete all media items with blob URLs
    const result = await prisma.media.deleteMany({
      where: {
        url: {
          startsWith: 'blob:'
        }
      }
    });

    return NextResponse.json({
      deletedCount: result.count,
      message: `Deleted ${result.count} broken blob URLs`
    });
  } catch (error) {
    console.error('Error cleaning up blob URLs:', error);
    return NextResponse.json({ error: 'Failed to cleanup blob URLs' }, { status: 500 });
  }
}
