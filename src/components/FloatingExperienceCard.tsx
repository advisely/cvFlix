'use client'
import Image from 'next/image';
import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { Card, Typography, Button, Popconfirm } from 'antd';
import { PlayCircleOutlined, CalendarOutlined, HomeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { Media } from '@prisma/client';
import MediaModal from './MediaModal';

const { Title, Text, Paragraph } = Typography;

interface Experience {
  id: string;
  title: string;
  company: { name: string };
  description?: string | null;
  startDate: string;
  endDate?: string | null;
  createdAt: string;
}

interface FloatingExperienceCardProps {
  experience: Experience & { 
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
      const timer = setTimeout(() => setShouldLoad(true), 100);
      return () => clearTimeout(timer);
    }
  }, [isVisible, shouldLoad]);

  useEffect(() => {
    const video = videoRef.current;
    if (video && shouldLoad) {
      video.preload = 'metadata';
      video.playsInline = true;
      
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              video.play().catch(() => {});
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

const FloatingExperienceCard = memo(({ 
  experience, 
  onClick, 
  onEdit,
  onDelete,
  showActions = false, 
  variant = 'default',
  index = 0,
  isVisible = true
}: FloatingExperienceCardProps) => {
  const [imageError, setImageError] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isMediaModalVisible, setIsMediaModalVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const primaryMedia = experience.cardMedia?.[0] || experience.media?.[0];

  const formattedDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    });
  }, []);

  const handleMediaClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMediaModalVisible(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsMediaModalVisible(false);
  }, []);

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
            <Text className="text-sm text-white/60 block">{experience.company.name}</Text>
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
              alt={experience.title}
              isVisible={isVisible}
              onError={() => setImageError(true)}
              priority={index < 3}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
          </>
        ) : null}
      </div>
    );

    return mediaContainer;
  }, [primaryMedia, imageError, videoError, experience.title, experience.company.name, handleMediaClick, isVisible, index]);

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
            <div className="mb-2 sm:mb-3">
              <Title 
                level={variant === 'compact' ? 5 : 4} 
                className="!text-white !mb-1 !font-semibold leading-tight text-sm sm:text-base"
                ellipsis={{ rows: 2, tooltip: true }}
              >
                {experience.title}
              </Title>
              
              <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                <HomeOutlined className="text-[#e50914] text-xs sm:text-sm" />
                <Text className="!text-[#e50914] font-medium text-xs sm:text-sm">
                  {experience.company.name}
                </Text>
              </div>
            </div>

            {experience.description && variant !== 'compact' && (
              <div className="mb-2 sm:mb-3">
                <Paragraph 
                  className="!text-white/80 !mb-0 text-xs sm:text-sm leading-relaxed"
                  ellipsis={{ 
                    rows: variant === 'detailed' ? 3 : 2, 
                    tooltip: experience.description 
                  }}
                >
                  {experience.description}
                </Paragraph>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <CalendarOutlined className="text-white/60 text-xs" />
                <Text className="!text-white/60 text-xs">
                  {formattedDate(experience.startDate)} - {experience.endDate ? formattedDate(experience.endDate) : 'Present'}
                </Text>
              </div>
            </div>

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
                    title="Delete Experience"
                    description="Are you sure you want to delete this experience?"
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

      {primaryMedia && isMediaModalVisible && (
        <MediaModal
          isVisible={isMediaModalVisible}
          onClose={handleModalClose}
          media={primaryMedia}
          highlightTitle={experience.title}
        />
      )}
    </>
  );
});

FloatingExperienceCard.displayName = 'FloatingExperienceCard';

export default FloatingExperienceCard;
