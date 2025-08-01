
import { Certification } from '@prisma/client'

interface CertificationCardProps {
  certification: Certification
}

const CertificationCard: React.FC<CertificationCardProps> = ({ certification }) => {
  const { name, issuer, issueDate } = certification

  const formatDate = (date: Date) => {
    return new Date(date).getFullYear().toString()
  }

  return (
    <div className="bg-[#303030] rounded-lg overflow-hidden transform hover:scale-105 transition-transform duration-200 h-full flex flex-col border border-[#404040] shadow-lg">
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-white">{name}</h3>
        <p className="text-md font-semibold text-[#e50914]">{issuer}</p>
        <p className="text-sm text-[#808080] mt-1">{formatDate(issueDate)}</p>
      </div>
    </div>
  )
}

export default CertificationCard
