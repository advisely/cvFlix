
import { Certification, Media } from '@prisma/client'
import { useState } from 'react'

interface CertificationCardProps {
  certification: Certification & { media?: Media[] }
}

const CertificationCard: React.FC<CertificationCardProps> = ({ certification }) => {
  const { name, issuer, issueDate, media = [] } = certification
  const [imageError, setImageError] = useState(false)

  const formatDate = (date: Date) => {
    return new Date(date).getFullYear().toString()
  }

  const firstImage = media?.find((m: Media) => m.type === 'image')
  const shouldShowImage = firstImage && !imageError

  return (
    <div className="bg-[#303030] rounded-lg overflow-hidden transform hover:scale-105 transition-transform duration-200 h-full flex flex-col border border-[#404040] shadow-lg">
      {/* Certification Image */}
      <div className="w-full h-48 bg-[#141414] flex items-center justify-center relative">
        {shouldShowImage ? (
          <img
            src={firstImage.url}
            alt={name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <span className="text-[#808080] text-xl font-bold">{issuer.charAt(0)}</span>
        )}
      </div>
      <div className="p-4 flex flex-col">
        <h3 className="text-lg font-bold text-white">{name}</h3>
        <p className="text-md font-semibold text-[#e50914]">{issuer}</p>
        <p className="text-sm text-[#808080] mt-1">{formatDate(issueDate)}</p>
      </div>
    </div>
  )
}

export default CertificationCard
