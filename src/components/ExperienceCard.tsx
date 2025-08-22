import { Company, Media } from '@prisma/client'
import { useState } from 'react'

// Serialized version for client-side use
interface SerializedExperience {
  id: string;
  title: string;
  startDate: string;
  endDate?: string | null;
  description?: string | null;
  companyId: string;
  company: Company;
  media?: Media[];
  homepageMedia?: Media[];
}

interface ExperienceCardProps {
  experience: SerializedExperience;
  onClick: () => void;
}

const ExperienceCard: React.FC<ExperienceCardProps> = ({ experience, onClick }) => {
  const { title, company, startDate, homepageMedia = [] } = experience
  const [imageError, setImageError] = useState(false)

  const formatDate = (date: string | null) => {
    if (!date) return 'Present'
    return new Date(date).getFullYear().toString()
  }

  const firstImage = homepageMedia?.find((m: Media) => m.type === 'image')
  const shouldShowImage = firstImage && !imageError

  return (
    <div 
      className="bg-[#303030] rounded-lg overflow-hidden transform hover:scale-105 transition-transform duration-200 h-full flex flex-col border border-[#404040] shadow-lg cursor-pointer"
      onClick={onClick}
    >
      <div className="w-full h-48 bg-[#141414] flex items-center justify-center relative">
        {shouldShowImage ? (
          <img
            src={firstImage.url}
            alt={title}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <span className="text-[#808080] text-xl font-bold">{company.name.charAt(0)}</span>
        )}
      </div>
      <div className="p-4 flex flex-col">
        <h3 className="text-lg font-bold text-white">{title}</h3>
        <p className="text-md font-semibold text-[#e50914]">{company.name}</p>
        <p className="text-sm text-[#808080] mt-1">
          {formatDate(startDate)}
        </p>
      </div>
    </div>
  )
}

export default ExperienceCard
