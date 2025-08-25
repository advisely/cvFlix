'use client'
import Image from 'next/image';
import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { Card, Typography, Button, Popconfirm } from 'antd';
import { PlayCircleOutlined, CalendarOutlined, HomeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useLanguage, getLocalizedText } from '@/contexts/LanguageContext';
import type { Media, Company } from '@prisma/client';
import MediaModal from './MediaModal';

const { Title, Text } = Typography;

interface Highlight {
  id: string;
  title: string;
  titleFr: string;
  company: Company;
  description?: string | null;
  descriptionFr?: string | null;
  startDate: string;
  createdAt: string;
}

interface FloatingHighlightCardProps {
  highlight: Highlight & { 
    media: Media[];
    homepageMedia?: Media[];
    cardMedia?: Media[];
  };
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
  index?: number;
  isVisible?: boolean;
}

// Performance-optimized LazyVideo component
const LazyVideo = memo(({ 
  src, 
  isVisible, 
  onError 
}: { 
  src: string; 
  isVisible: boolean; 
  onError: () => void;
}) => {
  const [shouldLoad, setShouldLoad] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isVisible && !shouldLoad) {
      // Delay video loading to prioritize initial render
      const timer = setTimeout(() => setShouldLoad(true), 100);
      return () => clearTimeout(timer);
    }
  }, [isVisible, shouldLoad]);

  useEffect(() => {
    const video = videoRef.current;
    if (video && shouldLoad) {
      // Optimize video for better performance
      video.preload = 'metadata';
      video.playsInline = true;
      
      // Handle intersection observer for auto-play control
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              video.play().catch(() => {
                // Gracefully handle auto-play failures
              });
            } else {
              video.pause();
            }
          });
        },
        { threshold: 0.5 }
      );

      observer.observe(video);
      
      return () => {
        observer.disconnect();
      };
    }
  }, [shouldLoad]);

  if (!shouldLoad) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] animate-pulse" />
    );
  }

  return (
    <video
      ref={videoRef}
      className="w-full h-full object-cover will-change-transform"
      muted
      loop
      playsInline
      onError={onError}
      style={{
        willChange: 'transform',
        backfaceVisibility: 'hidden',
        perspective: 1000,
      }}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
});

LazyVideo.displayName = 'LazyVideo';

// Performance-optimized LazyImage component
const LazyImage = memo(({ 
  src, 
  alt, 
  isVisible, 
  onError,
  priority = false
}: { 
  src: string; 
  alt: string; 
  isVisible: boolean; 
  onError: () => void;
  priority?: boolean;
}) => {
  const [shouldLoad, setShouldLoad] = useState(priority);

  useEffect(() => {
    if (isVisible && !shouldLoad) {
      setShouldLoad(true);
    }
  }, [isVisible, shouldLoad]);

  if (!shouldLoad) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] animate-pulse" />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
      className="object-cover will-change-transform"
      onError={onError}
      priority={priority}
      quality={85}
      style={{
        willChange: 'transform',
        backfaceVisibility: 'hidden',
      }}
    />
  );
});

LazyImage.displayName = 'LazyImage';

const FloatingHighlightCard = memo(({ 
  highlight, 
  onClick, 
  onEdit,
  onDelete,
  showActions = false, 
  variant = 'default',
  index = 0,
  isVisible = true
}: FloatingHighlightCardProps) => {
  const { language } = useLanguage();
  const [imageError, setImageError] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isMediaModalVisible, setIsMediaModalVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Prioritize cardMedia, then fall back to legacy media
  const primaryMedia = highlight.cardMedia?.[0] || highlight.media?.[0];

  // Removed formattedDate - using simple year display instead

  // Optimized media click handler
  const handleMediaClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMediaModalVisible(true);
  }, []);

  // Optimized modal close handler
  const handleModalClose = useCallback(() => {
    setIsMediaModalVisible(false);
  }, []);

  // Hardware-accelerated hover handlers
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const renderOptimizedMedia = useCallback(() => {
    if (!primaryMedia || (imageError && videoError)) {
      return (
        <div className="w-full h-48 sm:h-56 md:h-64 bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] flex items-center justify-center border-b border-[#404040]">
          <div className="text-center text-white/40">
            <HomeOutlined className="text-4xl mb-2" />
            <Text className="text-sm text-white/60 block">{getLocalizedText(highlight.company.name, highlight.company.nameFr, language)}</Text>
          </div>
        </div>
      );
    }

    const mediaContainer = (
      <div 
        className="relative w-full h-48 sm:h-56 md:h-64 overflow-hidden cursor-pointer touch-manipulation"
        onClick={handleMediaClick}
        style={{
          willChange: 'transform',
          backfaceVisibility: 'hidden',
        }}
      >
        {primaryMedia.type === 'video' && !videoError ? (
          <>
            <LazyVideo
              src={primaryMedia.url}
              isVisible={isVisible}
              onError={() => setVideoError(true)}
            />
            <div className="absolute inset-0 bg-black/20 pointer-events-none" />
            <div className="absolute top-3 right-3 pointer-events-none">
              <PlayCircleOutlined className="text-white/80 text-xl drop-shadow-lg" />
            </div>
          </>
        ) : primaryMedia.type === 'image' && !imageError ? (
          <>
            <LazyImage
              src={primaryMedia.url}
              alt={getLocalizedText(highlight.title, highlight.titleFr, language)}
              isVisible={isVisible}
              onError={() => setImageError(true)}
              priority={index < 3} // Prioritize first 3 cards
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
          </>
        ) : null}
      </div>
    );

    return mediaContainer;
  }, [primaryMedia, imageError, videoError, highlight.title, highlight.titleFr, highlight.company.name, highlight.company.nameFr, language, handleMediaClick, isVisible, index]);

  // Performance-optimized card styles with hardware acceleration
  const cardStyles = {
    background: 'linear-gradient(145deg, #303030 0%, #2a2a2a 100%)',
    transform: isHovered 
      ? 'translateY(-8px) translateZ(0) scale(1.02)' 
      : 'translateY(0) translateZ(0) scale(1)',
    transition: 'transform 0.16s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.16s cubic-bezier(0.4, 0, 0.2, 1)',
    willChange: 'transform',
    backfaceVisibility: 'hidden' as const,
    perspective: 1000,
    boxShadow: isHovered 
      ? '0 16px 64px rgba(0, 0, 0, 0.4), 0 4px 16px rgba(229, 9, 20, 0.3)'
      : '0 4px 16px rgba(0, 0, 0, 0.2), 0 1px 4px rgba(229, 9, 20, 0.1)',
  };

  const cardClasses = `
    group cursor-pointer overflow-hidden rounded-xl
    border border-[#404040] hover:border-[#e50914]/50
    bg-[#303030]
    backdrop-blur-sm w-full h-full
    ${variant === 'compact' ? 'sm:max-w-sm' : variant === 'detailed' ? 'sm:max-w-2xl' : 'sm:max-w-lg'}
    touch-manipulation select-none
  `;

  // Animation delay for staggered entrance
  const animationStyle = {
    animation: `cardSlideIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.08}s both`,
  };

  return (
    <>
      <style jsx>{`
        @keyframes cardSlideIn {
          0% {
            opacity: 0;
            transform: translateY(24px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
      
      <div
        ref={cardRef}
        style={animationStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Card
          className={cardClasses}
          variant="borderless"
          cover={renderOptimizedMedia()}
          onClick={onClick}
          style={cardStyles}
        >
          <div className="p-3 sm:p-4 md:p-2">
            {/* Header with title and company */}
            <div className="mb-2 sm:mb-3">
              <Title 
                level={variant === 'compact' ? 5 : 4} 
                className="!text-white !mb-1 !font-semibold leading-tight text-sm sm:text-base"
                ellipsis={{ rows: 2, tooltip: true }}
              >
                {getLocalizedText(highlight.title, highlight.titleFr, language)}
              </Title>
              
              <div className="flex items-center gap-2 mb-1 sm:mb-2">
                {highlight.company.logoUrl && (
                  <img
                    src={highlight.company.logoUrl}
                    alt={`${highlight.company.name} logo`}
                    className="object-contain rounded-sm shadow-sm"
                    style={{ width: '32px', height: '32px', minWidth: '32px', minHeight: '32px' }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                )}
                <Text className="!text-[#e50914] font-semibold text-xs sm:text-sm">
                  {getLocalizedText(highlight.company.name, highlight.company.nameFr, language)}
                </Text>
              </div>
            </div>


            {/* Date and metadata - Show year only */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <CalendarOutlined className="text-white/60 text-xs" />
                <Text className="!text-white/60 text-xs">
                  {new Date(highlight.startDate).getFullYear()}
                </Text>
              </div>
            </div>

            {/* Actions */}
            {showActions && (
              <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-[#404040]/50">
                <div className="flex gap-1 sm:gap-2">
                  <Button 
                    type="text" 
                    size="small"
                    icon={<EditOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit?.();
                    }}
                    className="!text-white/80 hover:!text-[#e50914] hover:!bg-[#e50914]/10 flex-1 !text-xs sm:!text-sm !px-2 sm:!px-3 !h-8 sm:!h-auto touch-manipulation"
                  >
                    <span className="hidden sm:inline">Edit</span>
                  </Button>
                  <Popconfirm
                    title="Delete Highlight"
                    description="Are you sure you want to delete this highlight?"
                    onConfirm={(e) => {
                      e?.stopPropagation();
                      onDelete?.();
                    }}
                    okText="Yes"
                    cancelText="No"
                    okButtonProps={{ danger: true }}
                  >
                    <Button 
                      type="text" 
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={(e) => e.stopPropagation()}
                      className="!text-white/80 hover:!text-red-500 hover:!bg-red-500/10 !text-xs sm:!text-sm !px-2 sm:!px-3 !h-8 sm:!h-auto touch-manipulation"
                      danger
                    >
                      <span className="hidden sm:inline">Delete</span>
                    </Button>
                  </Popconfirm>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Optimized Media Modal */}
      {primaryMedia && isMediaModalVisible && (
        <MediaModal
          isVisible={isMediaModalVisible}
          onClose={handleModalClose}
          media={primaryMedia}
          highlightTitle={getLocalizedText(highlight.title, highlight.titleFr, language)}
          company={getLocalizedText(highlight.company.name, highlight.company.nameFr, language)}
          description={getLocalizedText(highlight.description, highlight.descriptionFr, language)}
          startDate={highlight.startDate}
        />
      )}
    </>
  );
});

FloatingHighlightCard.displayName = 'FloatingHighlightCard';

export default FloatingHighlightCard;
