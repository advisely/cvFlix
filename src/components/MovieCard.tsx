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
    <div className="bg-[#303030] rounded-lg overflow-hidden transform hover:scale-105 transition-transform duration-200 h-full flex flex-col border border-[#404040] shadow-lg">
      {/* Placeholder for Company Logo */}
      <div className="w-full h-32 bg-[#141414] flex items-center justify-center">
        <span className="text-[#808080] text-xl font-bold">{company.name.charAt(0)}</span>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-white">{title}</h3>
        <p className="text-md font-semibold text-[#e50914]">{company.name}</p>
        <p className="text-sm text-[#808080] mt-1">
          {formatDate(startDate)} - {formatDate(endDate)}
        </p>
        <p className="text-[#d2d2d2] mt-2 text-sm flex-grow">{description}</p>
      </div>
    </div>
  )
}

export default MovieCard