
import { Education } from '@prisma/client'

interface EducationCardProps {
  education: Education
}

const EducationCard: React.FC<EducationCardProps> = ({ education }) => {
  const { institution, degree, field, startDate, endDate } = education

  const formatDate = (date: Date | null) => {
    if (!date) return 'Present'
    return new Date(date).getFullYear().toString()
  }

  return (
    <div className="bg-[#303030] rounded-lg overflow-hidden transform hover:scale-105 transition-transform duration-200 h-full flex flex-col border border-[#404040] shadow-lg">
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-white">{degree}</h3>
        <p className="text-md font-semibold text-[#e50914]">{institution}</p>
        <p className="text-sm text-[#808080] mt-1">{field}</p>
        <p className="text-sm text-[#808080] mt-1">
          {formatDate(startDate)} - {formatDate(endDate)}
        </p>
      </div>
    </div>
  )
}

export default EducationCard
