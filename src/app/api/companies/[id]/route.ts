import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { name, nameFr, logoUrl } = body

    if (!name || !nameFr) {
      return NextResponse.json({ error: 'Company name in both languages is required' }, { status: 400 })
    }

    const company = await prisma.company.update({
      where: { id: params.id },
      data: {
        name,
        nameFr,
        logoUrl: logoUrl || null
      }
    })

    return NextResponse.json(company)
  } catch (error) {
    console.error('Error updating company:', error)
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json({ error: 'A company with this name already exists' }, { status: 400 })
    }
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update company' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    // Check if company is being used by experiences
    const experienceCount = await prisma.experience.count({ where: { companyId: params.id } })

    if (experienceCount > 0) {
      return NextResponse.json({
        error: `Cannot delete company. It is being used by ${experienceCount} experience(s).`
      }, { status: 400 })
    }

    await prisma.company.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Company deleted successfully' })
  } catch (error) {
    console.error('Error deleting company:', error)
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete company' }, { status: 500 })
  }
}
