import { Company, Experience, Media } from '@prisma/client'
import { useState } from 'react'

interface MovieCardProps {
  experience: Experience & { company: Company; media?: Media[] }
}

const MovieCard: React.FC<MovieCardProps> = ({ experience }) => {
  const { title, description, startDate, endDate, company, media = [] } = experience
  const [imageError, setImageError] = useState(false)

  const formatDate = (date: Date | null) => {
    if (!date) return 'Present'
    return new Date(date).getFullYear().toString()
  }

  const firstImage = media?.find((m: Media) => m.type === 'image')
  const shouldShowImage = firstImage && !imageError

  return (
    <div className="bg-[#303030] rounded-lg overflow-hidden transform hover:scale-105 transition-transform duration-200 h-full flex flex-col border border-[#404040] shadow-lg">
      {/* Experience Image - Increased height */}
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

export default MovieCard
