'use client'

import { Company, Media } from '@prisma/client'
import { useState, useMemo } from 'react'
import { useLanguage, getLocalizedText } from '@/contexts/LanguageContext'
import ProfessionalTimeline, { ExperienceDateRange } from './ProfessionalTimeline'
import { HistoryOutlined } from '@ant-design/icons'

// Extended interface to support multi-period experiences
interface SerializedExperience {
  id: string;
  title: string;
  titleFr: string;
  startDate: string;
  endDate?: string | null;
  description?: string | null;
  descriptionFr?: string | null;
  companyId: string;
  company: Company & { nameFr: string; logoUrl?: string | null };
  media?: Media[];
  homepageMedia?: Media[];
}

// Enhanced interface for multi-period experiences
interface MultiPeriodExperience {
  id: string;
  title: string;
  titleFr: string;
  description?: string | null;
  descriptionFr?: string | null;
  companyId: string;
  company: Company & { nameFr: string; logoUrl?: string | null };

  // Multi-period support
  dateRanges: ExperienceDateRange[];

  // Computed properties for display and sorting
  earliestStartDate: string;
  latestEndDate: string | null;
  isCurrentPosition: boolean;
  totalDurationMonths: number;
  formattedPeriods: string;

  // Media and relations
  media?: Media[];
  homepageMedia?: Media[];
  cardMedia?: Media[];
}

interface ExperienceCardProps {
  experience: SerializedExperience | MultiPeriodExperience;
  onClick: () => void;
  variant?: 'compact' | 'detailed' | 'timeline';
  showTimeline?: boolean;
  maxTimelineRanges?: number;
}

// Type guard to check if experience has multi-period structure
const isMultiPeriodExperience = (experience: unknown): experience is MultiPeriodExperience => {
  return (
    typeof experience === "object" &&
    experience !== null &&
    "dateRanges" in experience &&
    Array.isArray((experience as { dateRanges?: unknown[] }).dateRanges)
  );
};

// Convert single-period experience to multi-period format
const convertToMultiPeriod = (experience: SerializedExperience): MultiPeriodExperience => {
  const dateRange: ExperienceDateRange = {
    id: `range-${experience.id}`,
    startDate: experience.startDate,
    endDate: experience.endDate || null,
    isCurrent: !experience.endDate
  };

  return {
    ...experience,
    dateRanges: [dateRange],
    earliestStartDate: experience.startDate,
    latestEndDate: experience.endDate || null,
    isCurrentPosition: !experience.endDate,
    totalDurationMonths: 0, // Removed duration calculation
    formattedPeriods: '', // Removed formatted periods
    cardMedia: experience.media || []
  };
};

const ExperienceCard: React.FC<ExperienceCardProps> = ({
  experience,
  onClick,
  variant = 'detailed',
  showTimeline = true,
  maxTimelineRanges = 5
}) => {
  const { language } = useLanguage()
  
  // Enhanced state management with separate error states and loading
  const [homepageImageError, setHomepageImageError] = useState(false)
  const [companyLogoError, setCompanyLogoError] = useState(false)
  const [imageLoading, setImageLoading] = useState(false)

  // Convert to multi-period format if needed
  const multiPeriodExp = useMemo(() => {
    return isMultiPeriodExperience(experience)
      ? experience
      : convertToMultiPeriod(experience);
  }, [experience]);

  const { title, titleFr, company, dateRanges, homepageMedia = [] } = multiPeriodExp;

  const localizedTitle = getLocalizedText(title, titleFr, language)
  const localizedCompanyName = getLocalizedText(company.name, company.nameFr, language)

  const firstImage = homepageMedia?.find((m: Media) => m.type === 'image')
  const companyLogo = company.logoUrl

  // CORRECTED display logic - Homepage images take priority, company logos are separate brand identifiers
  const shouldShowHomepageImage = firstImage && !homepageImageError
  const shouldShowCompanyLogo = companyLogo && !companyLogoError && !shouldShowHomepageImage
  const shouldShowLetterFallback = !shouldShowHomepageImage && !shouldShowCompanyLogo

  // Separate error handlers for different image types
  const handleHomepageImageError = () => {
    setHomepageImageError(true)
    setImageLoading(false)
  }

  const handleCompanyLogoError = () => {
    setCompanyLogoError(true)
    setImageLoading(false)
  }

  const handleImageLoad = () => {
    setImageLoading(false)
  }

  // Image loading state management optimized

  const isMultiPeriod = dateRanges.length > 1;

  // Enhanced hover effect with hardware acceleration for 60fps performance
  const cardClasses = [
    "bg-[#303030] rounded-lg overflow-hidden floating-card-optimized",
    "h-full flex flex-col border border-[#404040] shadow-netflix cursor-pointer",
    "hover:shadow-netflix-hover",
    isMultiPeriod ? "hover:border-[#e50914]/50" : "",
    variant === 'compact' ? "max-w-sm" : variant === 'timeline' ? "max-w-2xl" : ""
  ].filter(Boolean).join(" ");

  return (
    <div 
      className={`experience-card ${cardClasses}`} 
      onClick={onClick} 
      data-card-id={experience.id}
      style={{ cursor: 'pointer' }}
    >
      {/* Enhanced Media Section with optimized loading states and aspect ratio */}
      <div className="w-full h-48 bg-gradient-to-br from-[#141414] to-[#0a0a0a] flex items-center justify-center relative overflow-hidden">
        {/* Hardware-accelerated loading state with smooth transition */}
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#141414]/95 backdrop-blur-sm z-10 animate-in fade-in duration-200">
            {shouldShowCompanyLogo ? (
              <div className="logo-skeleton w-16 h-16 rounded-lg"></div>
            ) : (
              <div className="w-8 h-8 border-2 border-[#e50914] border-t-transparent rounded-full animate-spin will-change-transform"></div>
            )}
          </div>
        )}

        {/* Cascading fallback display logic */}
        {shouldShowHomepageImage ? (
          <img
            src={firstImage.url}
            alt={localizedTitle}
            className="w-full h-full object-cover transition-all duration-300 ease-out will-change-auto"
            onLoad={handleImageLoad}
            onLoadStart={() => setImageLoading(true)}
            onError={handleHomepageImageError}
            loading="lazy"
            decoding="async"
          />
        ) : shouldShowCompanyLogo ? (
          <div className="company-logo-container w-full h-full p-2 rounded-lg shadow-inner">
            <img 
              src={companyLogo}
              alt={`${localizedCompanyName} logo`}
              className="company-logo w-full h-full object-contain p-4 transition-all duration-300 ease-out will-change-auto"
              onLoad={handleImageLoad}
              onLoadStart={() => setImageLoading(true)}
              onError={handleCompanyLogoError}
              loading="lazy"
              decoding="async"
            />
          </div>
        ) : (
          <div className="company-letter-fallback w-20 h-20 bg-gradient-to-br from-[#e50914]/20 to-[#e50914]/40 rounded-full flex items-center justify-center border-2 border-[#e50914]/30 shadow-lg backdrop-blur-sm">
            <span className="text-white text-2xl font-bold tracking-wide drop-shadow-lg">{localizedCompanyName.charAt(0)}</span>
          </div>
        )}

        {/* Multi-Period Indicator with enhanced visibility */}
        {isMultiPeriod && (
          <div className="absolute top-3 right-3 w-8 h-8 bg-[#e50914] rounded-full flex items-center justify-center border-2 border-white/20 shadow-lg backdrop-blur-sm z-20">
            <HistoryOutlined className="text-white text-sm drop-shadow-sm" />
          </div>
        )}

      </div>

      {/* Content Section with enhanced typography */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Primary Information with improved contrast */}
        <div className="mb-3">
          <h3 className="text-lg font-bold text-white mb-1 leading-tight line-clamp-2 drop-shadow-sm">{localizedTitle}</h3>
          <div className="flex items-center gap-2">
            {/* Company logo positioned next to company name */}
            {companyLogo && !companyLogoError && (
              <img
                src={companyLogo}
                alt={`${localizedCompanyName} logo`}
                className="company-logo-icon object-contain rounded-sm shadow-sm"
                style={{ width: '32px', height: '32px', minWidth: '32px', minHeight: '32px' }}
                onError={() => setCompanyLogoError(true)}
                loading="lazy"
                decoding="async"
              />
            )}
            <p className="text-md font-semibold text-[#e50914] tracking-wide">{localizedCompanyName}</p>
          </div>
        </div>

        {/* Clean Timeline Section without Company Logo */}
        {showTimeline && dateRanges.length > 0 && (
          <div className="mb-3 flex-grow">
            <ProfessionalTimeline
              dateRanges={dateRanges}
              format={variant === 'compact' ? 'compact' : 'detailed'}
              maxRanges={maxTimelineRanges}
              backgroundColor="#303030"
            />
          </div>
        )}

        {/* Removed Experience Summary Section - No more duration calculations */}

        {/* Removed year display from compact variant - keeping clean presentation */}
      </div>
    </div>
  )
}

export default ExperienceCard
export type { MultiPeriodExperience, ExperienceDateRange }
