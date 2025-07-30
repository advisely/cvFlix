
import { prisma } from '@/lib/prisma'
import type { Company, Experience } from '@prisma/client'
import MovieCard from '@/components/MovieCard'
import SeriesCard from '@/components/SeriesCard'
import { Carousel } from '@/components/Carousel'



export default async function Home() {
  const companies = await prisma.company.findMany({
    include: {
      experiences: true,
    },
  })

    const singleExperiences = companies.filter((c: Company & { experiences: Experience[] }) => c.experiences.length === 1)
    const seriesExperiences = companies.filter((c: Company & { experiences: Experience[] }) => c.experiences.length > 1)

  return (
    <main className="bg-gray-900 text-white min-h-screen">
      <div className="p-4 md:p-8">
        <h1 className="text-3xl md:text-5xl font-bold mb-8">cvFlix</h1>

        <div className="mb-8">
          <h2 className="text-xl md:text-2xl font-bold mb-4">Work Experience</h2>
          <Carousel>
                        {singleExperiences.map((company: Company & { experiences: Experience[] }) => (
              <div key={company.id} className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.33%] p-2">
                <MovieCard experience={{ ...company.experiences[0], company }} />
              </div>
            ))}
          </Carousel>
        </div>

        <div className="mb-8">
          <h2 className="text-xl md:text-2xl font-bold mb-4">Series</h2>
          <Carousel>
                        {seriesExperiences.map((company: Company & { experiences: Experience[] }) => (
              <div key={company.id} className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.33%] p-2">
                <SeriesCard company={company} />
              </div>
            ))}
          </Carousel>
        </div>
      </div>
    </main>
  )
}
