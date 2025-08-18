
import { Company, Experience, Media } from '@prisma/client'
import { useState } from 'react'
import { Modal } from 'antd'

interface SeriesCardProps {
  company: Company & { experiences: (Experience & { media?: Media[] })[] }
}

const SeriesCard: React.FC<SeriesCardProps> = ({ company }) => {
  const [imageError, setImageError] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const formatDate = (date: Date | null) => {
    if (!date) return 'Present'
    return new Date(date).getFullYear().toString()
  }

  const firstExperience = company.experiences[0]
  const firstImage = firstExperience?.media?.find((m: Media) => m.type === 'image')
  const shouldShowImage = firstImage && !imageError

  const cardContent = (
    <div className="bg-[#303030] rounded-lg overflow-hidden transform hover:scale-105 transition-transform duration-200 h-full flex flex-col border border-[#404040] shadow-lg">
      <div className="w-full h-48 bg-[#141414] flex items-center justify-center relative">
        {shouldShowImage ? (
          <img
            src={firstImage.url}
            alt={company.name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <span className="text-[#808080] text-xl font-bold">{company.name.charAt(0)}</span>
        )}
      </div>
      <div className="p-4 flex flex-col">
        <h3 className="text-lg font-bold text-white">{company.name}</h3>
        <p className="text-sm text-[#e50914] mt-1">{company.experiences.length} Roles</p>
      </div>
    </div>
  );

  return (
    <>
      <div onClick={() => setIsModalOpen(true)} className="cursor-pointer">
        {cardContent}
      </div>
      
      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={600}
        centered
        title={<span className="text-white">{company.name}</span>}
        styles={{
          content: { backgroundColor: '#303030' },
          header: { backgroundColor: '#303030', borderBottom: '1px solid #404040' },
          body: { backgroundColor: '#303030' }
        }}
      >
        <div className="space-y-6">
          {company.experiences.map((experience) => (
            <div key={experience.id} className="border-b border-gray-700 pb-4 last:border-b-0">
              <h3 className="text-xl font-bold text-white">{experience.title}</h3>
              <p className="text-sm text-gray-400 mt-1">
                {formatDate(experience.startDate)}
              </p>
            </div>
          ))}
        </div>
      </Modal>
    </>
  )
}

export default SeriesCard
