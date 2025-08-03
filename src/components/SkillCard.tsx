
import { Skill, Media } from '@prisma/client'
import { useState } from 'react'

interface SkillCardProps {
  skill: Skill & { media?: Media[] }
}

const SkillCard: React.FC<SkillCardProps> = ({ skill }) => {
  const { name, category, media = [] } = skill
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
            alt={name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <span className="text-[#808080] text-xl font-bold">{name.charAt(0)}</span>
        )}
      </div>
      <div className="p-4 flex flex-col justify-center items-center">
        <h3 className="text-lg font-bold text-white">{name}</h3>
        <p className="text-sm text-[#e50914] mt-1">{category}</p>
      </div>
    </div>
  )
}

export default SkillCard
