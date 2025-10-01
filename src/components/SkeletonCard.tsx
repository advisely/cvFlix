'use client'

import React from 'react';

interface SkeletonCardProps {
  type?: 'movie' | 'series' | 'education' | 'certification' | 'skill' | 'contribution' | 'book';
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({ type = 'movie' }) => {
  // Determine height based on card type
  const getHeightClass = () => {
    switch (type) {
      case 'series':
        return 'h-48';
      case 'education':
      case 'certification':
      case 'skill':
      case 'contribution':
      case 'book':
        return 'h-40';
      case 'movie':
      default:
        return 'h-56';
    }
  };

  return (
    <div className={`bg-[#303030] rounded-lg overflow-hidden animate-pulse ${getHeightClass()} flex flex-col border border-[#404040] shadow-lg`}>
      {/* Image placeholder */}
      <div className="w-full h-32 bg-[#141414] flex items-center justify-center">
        <div className="bg-[#404040] rounded-full w-12 h-12" />
      </div>
      
      {/* Content placeholder */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Title */}
        <div className="h-4 bg-[#404040] rounded mb-2"></div>
        <div className="h-3 bg-[#404040] rounded mb-3 w-3/4"></div>
        
        {/* Date */}
        <div className="h-2 bg-[#404040] rounded mb-2 w-1/2"></div>
        
        {/* Description */}
        <div className="mt-2 flex-grow">
          <div className="h-2 bg-[#404040] rounded mb-1"></div>
          <div className="h-2 bg-[#404040] rounded mb-1 w-5/6"></div>
          <div className="h-2 bg-[#404040] rounded w-4/6"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
