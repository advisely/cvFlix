
import { Knowledge, Media } from '@prisma/client'
import { useState } from 'react'

interface SkillCardProps {
  skill: Knowledge & { media?: Media[] }
}

const SkillCard: React.FC<SkillCardProps> = ({ skill }) => {
  const {
    title,
    category,
    competencyLevel,
    media = [],
  } = skill
  const [imageError, setImageError] = useState(false)

  const firstImage = media?.find((m: Media) => m.type === 'image')
  const shouldShowImage = firstImage && !imageError

  return (
    <div className="bg-[#303030] rounded-lg overflow-hidden transform hover:scale-105 transition-transform duration-200 h-full flex flex-col border border-[#404040] shadow-lg">
      {/* Skill Image */}
      <div className="w-full h-48 bg-[#141414] flex items-center justify-center relative">
        {shouldShowImage ? (
          <img
            src={firstImage.url}
            alt={title}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <span className="text-[#808080] text-xl font-bold">{(title || 'S').charAt(0)}</span>
        )}
      </div>
      <div className="p-4 flex flex-col justify-center items-center">
        <h3 className="text-lg font-bold text-white">{title}</h3>
        {category && <p className="text-sm text-[#e50914] mt-1">{category}</p>}
        {competencyLevel && (
          <p className="text-xs text-[#808080] mt-1 uppercase tracking-wide">
            {competencyLevel.toLowerCase()}
          </p>
        )}
      </div>
    </div>
  )
}

export default SkillCard
