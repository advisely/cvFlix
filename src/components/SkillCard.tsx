
import { Skill } from '@prisma/client'

interface SkillCardProps {
  skill: Skill
}

const SkillCard: React.FC<SkillCardProps> = ({ skill }) => {
  const { name, category } = skill

  return (
    <div className="bg-[#303030] rounded-lg overflow-hidden transform hover:scale-105 transition-transform duration-200 h-full flex flex-col border border-[#404040] shadow-lg">
      <div className="p-4 flex flex-col flex-grow justify-center items-center">
        <h3 className="text-lg font-bold text-white">{name}</h3>
        <p className="text-sm text-[#e50914] mt-1">{category}</p>
      </div>
    </div>
  )
}

export default SkillCard
