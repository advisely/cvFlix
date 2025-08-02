
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'



export async function GET() {
  try {
    const education = await prisma.education.findMany()
    const media = await prisma.media.findMany()
    
    const educationWithMedia = education.map(edu => ({
      ...edu,
      media: media.filter(m => m.educationId === edu.id)
    }))
    
    return NextResponse.json(educationWithMedia)
  } catch (error) {
    console.error('Education API error:', error)
    return NextResponse.json({ error: 'Failed to fetch education' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const newEducation = await prisma.education.create({ data: body })
    const media = await prisma.media.findMany({
      where: { educationId: newEducation.id }
    })
    return NextResponse.json({ ...newEducation, media })
  } catch (error) {
    console.error('Education POST error:', error)
    return NextResponse.json({ error: 'Failed to create education' }, { status: 500 })
  }
}
