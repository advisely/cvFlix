
import { Company, Experience } from '@prisma/client'
import { Modal } from './Modal'

interface SeriesCardProps {
  company: Company & { experiences: Experience[] }
}

const SeriesCard: React.FC<SeriesCardProps> = ({ company }) => {
  const formatDate = (date: Date | null) => {
    if (!date) return 'Present'
    return new Date(date).getFullYear().toString()
  }

  const cardContent = (
    <div className="bg-gray-800 rounded-lg overflow-hidden transform hover:scale-105 transition-transform duration-200 h-full flex flex-col">
      <div className="w-full h-32 bg-gray-700 flex items-center justify-center">
        <span className="text-gray-500">Logo</span>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-bold">{company.name}</h3>
        <p className="text-sm text-gray-400 mt-1">{company.experiences.length} Roles</p>
      </div>
    </div>
  );

  return (
    <Modal button={cardContent}>
      <div className="bg-gray-800 p-6 rounded-lg max-w-2xl w-full">
        <h2 className="text-3xl font-bold mb-6 text-white">{company.name}</h2>
        <div className="space-y-6">
          {company.experiences.map((experience) => (
            <div key={experience.id} className="border-b border-gray-700 pb-4 last:border-b-0">
              <h3 className="text-xl font-bold text-white">{experience.title}</h3>
              <p className="text-sm text-gray-400 mt-1">
                {formatDate(experience.startDate)} - {formatDate(experience.endDate)}
              </p>
              <p className="text-gray-300 mt-2">{experience.description}</p>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  )
}

export default SeriesCard
