
import { Company, Experience } from '@prisma/client'
import { Modal } from './Modal'

interface SeriesCardProps {
  company: Company & { experiences: Experience[] }
}

const SeriesCard: React.FC<SeriesCardProps> = ({ company }) => {
  return (
    <Modal buttonText={company.name}>
      <h2 className="text-2xl font-bold mb-4">{company.name}</h2>
      <div>
        {company.experiences.map((experience) => (
          <div key={experience.id} className="mb-4">
            <h3 className="text-xl font-bold">{experience.title}</h3>
            <p className="text-gray-400">{experience.description}</p>
          </div>
        ))}
      </div>
    </Modal>
  )
}

export default SeriesCard
