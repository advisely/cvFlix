'use client'

import React, { useMemo } from 'react';
import { Typography } from 'antd';

const { Text } = Typography;

export interface ExperienceDateRange {
  id: string;
  startDate: string;
  endDate: string | null;
  isCurrent?: boolean;
}

interface ProfessionalTimelineProps {
  dateRanges: ExperienceDateRange[];
  format?: 'compact' | 'detailed' | 'visual';
  maxRanges?: number;
  showDuration?: boolean;
  showCurrentIndicator?: boolean;
  className?: string;
  backgroundColor?: string;
}

// Color contrast utility functions
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

const calculateLuminance = (r: number, g: number, b: number): number => {
  const [rs, gs, bs] = [r, g, b].map(c => {
    const sRGB = c / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

const getContrastSafeTextColor = (backgroundColor?: string): string => {
  if (!backgroundColor) {
    return '#ffffff'; // Default to white for dark backgrounds
  }
  
  // Handle gradient backgrounds - use a safe default
  if (backgroundColor.includes('gradient') || backgroundColor.includes('linear-gradient')) {
    return '#ffffff'; // Safe default for gradients
  }
  
  // Handle solid colors
  const rgb = hexToRgb(backgroundColor);
  if (!rgb) {
    return '#ffffff'; // Fallback if color parsing fails
  }
  
  const luminance = calculateLuminance(rgb.r, rgb.g, rgb.b);
  return luminance > 0.5 ? '#1f1f1f' : '#ffffff'; // Dark text on light, light text on dark
};

// FIXED: Function to format only start years separated by dashes
const formatStartYearsOnly = (ranges: ExperienceDateRange[]): string => {
  const sortedRanges = ranges.sort((a, b) => 
    new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );
  
  return sortedRanges.map(range => {
    return new Date(range.startDate).getFullYear().toString();
  }).join(' - ');
};


const ProfessionalTimeline: React.FC<ProfessionalTimelineProps> = ({
  dateRanges,
  format = 'detailed',
  maxRanges = 5,
  className = '',
  backgroundColor
}) => {
  const sortedRanges = useMemo(() => 
    dateRanges.sort((a, b) => 
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    ), [dateRanges]
  );

  const displayRanges = sortedRanges.slice(0, maxRanges);
  
  // Get contrast-safe text color based on background
  const contrastSafeColor = getContrastSafeTextColor(backgroundColor);

  if (!dateRanges.length || !dateRanges.some(r => r.startDate)) {
    return null;
  }

  if (format === 'compact') {
    return (
      <div className={`timeline-compact ${className}`}>
        <div className="flex items-center gap-2 flex-wrap">
          <Text 
            className="font-medium"
            style={{ color: contrastSafeColor }}
          >
            {formatStartYearsOnly(displayRanges)}
          </Text>
        </div>
      </div>
    );
  }

  if (format === 'visual') {
    return (
      <div className={`timeline-visual ${className}`}>
        <div className="bg-[#1a1a1a] rounded-lg p-4 border border-[#404040]">
          <div className="flex items-center gap-2">
            <Text 
              className="font-medium"
              style={{ color: contrastSafeColor }}
            >
              {formatStartYearsOnly(displayRanges)}
            </Text>
          </div>
        </div>
      </div>
    );
  }

  // Default 'detailed' format - Clean timeline display
  return (
    <div className={`timeline-detailed ${className}`}>
      <div className="timeline-section">
        <div className="flex items-center gap-2">
          <Text 
            className="font-medium"
            style={{ color: contrastSafeColor }}
          >
            {formatStartYearsOnly(displayRanges)}
          </Text>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalTimeline;
