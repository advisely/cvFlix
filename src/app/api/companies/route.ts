import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const companies = await prisma.company.findMany({
      orderBy: { name: 'asc' }
    })
    return NextResponse.json(companies)
  } catch (error) {
    console.error('Error fetching companies:', error)
    return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, nameFr, logoUrl } = body

    if (!name || !nameFr) {
      return NextResponse.json({ error: 'Company name in both languages is required' }, { status: 400 })
    }

    const company = await prisma.company.create({
      data: {
        name,
        nameFr,
        logoUrl: logoUrl || null
      }
    })

    return NextResponse.json(company)
  } catch (error) {
    console.error('Error creating company:', error)
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json({ error: 'A company with this name already exists' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create company' }, { status: 500 })
  }
}
