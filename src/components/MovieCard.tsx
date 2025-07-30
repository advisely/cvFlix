import { Experience } from '@prisma/client'

interface MovieCardProps {
  experience: Experience
}

const MovieCard: React.FC<MovieCardProps> = ({ experience }) => {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden transform hover:scale-105 transition-transform duration-200">
      <div className="p-4">
        <h3 className="text-xl font-bold">{experience.title}</h3>
        <p className="text-gray-400 mt-2">{experience.description}</p>
      </div>
    </div>
  )
}

export default MovieCard