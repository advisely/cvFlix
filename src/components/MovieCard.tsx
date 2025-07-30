import { Company, Experience } from '@prisma/client'

interface MovieCardProps {
  experience: Experience & { company: Company }
}

const MovieCard: React.FC<MovieCardProps> = ({ experience }) => {
  const { title, description, startDate, endDate, company } = experience

  const formatDate = (date: Date | null) => {
    if (!date) return 'Present'
    return new Date(date).getFullYear().toString()
  }

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden transform hover:scale-105 transition-transform duration-200 h-full flex flex-col">
      {/* Placeholder for Company Logo */}
      <div className="w-full h-32 bg-gray-700 flex items-center justify-center">
        <span className="text-gray-500">Logo</span>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-bold">{title}</h3>
        <p className="text-md font-semibold text-gray-300">{company.name}</p>
        <p className="text-sm text-gray-400 mt-1">
          {formatDate(startDate)} - {formatDate(endDate)}
        </p>
        <p className="text-gray-400 mt-2 text-sm flex-grow">{description}</p>
      </div>
    </div>
  )
}

export default MovieCard