'use client'

import { useState } from 'react';
import type { Media, Company } from '@prisma/client';

interface Highlight {
  id: string;
  title: string;
  company: Company;
  description?: string | null;
  startDate: string;
  createdAt: string;
}

interface HighlightCardProps {
  highlight: Highlight & { 
    media: Media[];
    homepageMedia?: Media[];
    cardMedia?: Media[];
  };
  onClick?: () => void;
}

const HighlightCard = ({ highlight, onClick }: HighlightCardProps) => {
  const [imageError, setImageError] = useState(false);
  
  // Prioritize homepageMedia, then fall back to legacy media
  const primaryMedia = highlight.homepageMedia?.[0] || highlight.media?.[0];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  };

  return (
    <div 
      className="relative w-full h-[50vh] md:h-[60vh] lg:h-[70vh] overflow-hidden rounded-lg group cursor-pointer"
      onClick={onClick}
    >
      {/* Background Media */}
      {primaryMedia && !imageError ? (
        primaryMedia.type === 'video' ? (
          <video
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          >
            <source src={primaryMedia.url} type="video/mp4" />
          </video>
        ) : (
          <img
            src={primaryMedia.url}
            alt={highlight.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        )
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#333] to-[#111] flex items-center justify-center">
          <div className="text-center text-white/60">
            <div className="text-4xl mb-2">🎬</div>
            <div className="text-sm">No media available</div>
          </div>
        </div>
      )}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Content Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
        <div className="text-white">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 leading-tight">
            {highlight.title}
          </h2>
          <div className="flex items-center gap-2 mb-2">
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
            <p className="text-lg md:text-xl font-semibold text-[#e50914]">
              {highlight.company.name}
            </p>
          </div>
          <p className="text-sm md:text-base text-white/70">
            {formatDate(highlight.startDate)}
          </p>
        </div>
      </div>

      {/* Hover Effect */}
      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
};

export default HighlightCard;
