'use client'

import { Row, Col, Typography, Empty, Spin } from 'antd';
import { useState, useEffect, useRef, useCallback } from 'react';
import FloatingHighlightCard from './FloatingHighlightCard';
import type { Media, Company } from '@prisma/client';

const { Title } = Typography;

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

interface HighlightCardGridProps {
  highlights: (Highlight & { media: Media[] })[];
  title?: string;
  variant?: 'default' | 'compact' | 'detailed';
  showActions?: boolean;
  loading?: boolean;
  onCardClick?: (highlight: Highlight & { media: Media[] }) => void;
  onCardEdit?: (highlight: Highlight & { media: Media[] }) => void;
  onCardDelete?: (highlight: Highlight & { media: Media[] }) => void;
  gridProps?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    xxl?: number;
  };
}

// Performance-optimized grid component with intersection observer
const HighlightCardGrid = ({ 
  highlights, 
  title = "Highlights",
  variant = 'default',
  showActions = false,
  loading = false,
  onCardClick,
  onCardEdit,
  onCardDelete,
  gridProps = { xs: 24, sm: 12, md: 12, lg: 8, xl: 6, xxl: 4 }
}: HighlightCardGridProps) => {
  const [visibleCards, setVisibleCards] = useState<Set<string>>(new Set());
  const gridRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Intersection Observer for lazy loading cards
  useEffect(() => {
    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const cardId = entry.target.getAttribute('data-card-id');
              if (cardId) {
                setVisibleCards(prev => new Set([...prev, cardId]));
              }
            }
          });
        },
        {
          rootMargin: '50px',
          threshold: 0.1
        }
      );
    }

    const observer = observerRef.current;
    const cardElements = gridRef.current?.querySelectorAll('[data-card-id]');
    
    cardElements?.forEach(el => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, [highlights]);

  // Cleanup observer on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Optimized card click handlers
  const handleCardClick = useCallback((highlight: Highlight & { media: Media[] }) => {
    onCardClick?.(highlight);
  }, [onCardClick]);

  const handleCardEdit = useCallback((highlight: Highlight & { media: Media[] }) => {
    onCardEdit?.(highlight);
  }, [onCardEdit]);

  const handleCardDelete = useCallback((highlight: Highlight & { media: Media[] }) => {
    onCardDelete?.(highlight);
  }, [onCardDelete]);

  if (loading) {
    return (
      <div className="mb-12">
        {title && (
          <Title level={2} className="!text-white mb-6">
            {title}
          </Title>
        )}
        <div className="text-center py-12">
          <Spin size="large" />
        </div>
      </div>
    );
  }

  if (!highlights || highlights.length === 0) {
    return (
      <div className="mb-12">
        {title && (
          <Title level={2} className="!text-white mb-6">
            {title}
          </Title>
        )}
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <span className="text-white/60">
              No highlights available
            </span>
          }
          className="py-12"
        />
      </div>
    );
  }

  return (
    <div className="mb-12" ref={gridRef}>
      {title && (
        <Title 
          level={2} 
          className="!text-white mb-6 !font-bold"
          style={{ color: '#ffffff' }}
        >
          {title}
        </Title>
      )}
      
      <Row 
        gutter={[{ xs: 8, sm: 16, md: 24 }, { xs: 12, sm: 16, md: 24 }]} 
        className="px-1 sm:px-2"
      >
        {highlights.map((highlight, index) => (
          <Col key={highlight.id} {...gridProps}>
            <div 
              className="h-full"
              data-card-id={highlight.id}
              style={{
                // Staggered animation with performance optimization
                willChange: 'opacity, transform',
                backfaceVisibility: 'hidden',
              }}
            >
              <FloatingHighlightCard
                highlight={highlight}
                variant={variant}
                showActions={showActions}
                index={index}
                isVisible={visibleCards.has(highlight.id)}
                onClick={() => handleCardClick(highlight)}
                onEdit={() => handleCardEdit(highlight)}
                onDelete={() => handleCardDelete(highlight)}
              />
            </div>
          </Col>
        ))}
      </Row>
      
      {/* Performance-optimized animations */}
      <style jsx>{`
        @keyframes fadeInUpStaggered {
          0% {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        [data-card-id] {
          animation: fadeInUpStaggered 0.6s cubic-bezier(0.4, 0, 0.2, 1) both;
        }
        
        /* Hardware acceleration hints */
        .ant-col {
          transform: translateZ(0);
          will-change: transform;
        }
      `}</style>
    </div>
  );
};

export default HighlightCardGrid;
