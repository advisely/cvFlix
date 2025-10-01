'use client'

import React from 'react';
import SkeletonCard from './SkeletonCard';

interface SkeletonCarouselProps {
  title: string;
  cardType?: 'movie' | 'series' | 'education' | 'certification' | 'skill' | 'contribution' | 'book';
  count?: number;
}

const SkeletonCarousel: React.FC<SkeletonCarouselProps> = ({ 
  title, 
  cardType = 'movie',
  count = 3 
}) => {
  const testId = `skeleton-${title.replace(/\s+/g, '-')}`;
  return (
    <div className="mb-8" data-testid={testId}>
      <div className="h-6 bg-[#404040] rounded mb-4 w-1/3 animate-pulse"></div>
      <div className="relative">
        <div className="overflow-hidden">
          <div className="flex">
            {Array.from({ length: count }).map((_, index) => (
              <div 
                key={index} 
                className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.33%] p-2"
              >
                <SkeletonCard type={cardType} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCarousel;
