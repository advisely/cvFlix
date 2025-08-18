'use client'

import { useState } from 'react';
import { Card, Typography, Tag, Button, Popconfirm } from 'antd';
import { PlayCircleOutlined, CalendarOutlined, HomeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { Media } from '@prisma/client';

const { Title, Text, Paragraph } = Typography;

interface Highlight {
  id: string;
  title: string;
  company: string;
  description?: string | null;
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
}

const FloatingHighlightCard = ({ 
  highlight, 
  onClick, 
  onEdit,
  onDelete,
  showActions = false, 
  variant = 'default' 
}: FloatingHighlightCardProps) => {
  const [imageError, setImageError] = useState(false);
  const [videoError, setVideoError] = useState(false);
  
  // Prioritize cardMedia, then fall back to legacy media
  const primaryMedia = highlight.cardMedia?.[0] || highlight.media?.[0];
  const relevantMedia = highlight.cardMedia?.length ? highlight.cardMedia : highlight.media;
  const totalMediaCount = relevantMedia?.length || 0;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderMedia = () => {
    if (!primaryMedia || (imageError && videoError)) {
      return (
        <div className="w-full h-64 bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] flex items-center justify-center border-b border-[#404040]">
          <div className="text-center text-white/40">
            <HomeOutlined className="text-4xl mb-2" />
            <Text className="text-sm text-white/60 block">{highlight.company}</Text>
          </div>
        </div>
      );
    }

    if (primaryMedia.type === 'video' && !videoError) {
      return (
        <div className="relative w-full h-64 overflow-hidden">
          <video
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            onError={() => setVideoError(true)}
          >
            <source src={primaryMedia.url} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute top-3 right-3">
            <PlayCircleOutlined className="text-white/80 text-xl" />
          </div>
        </div>
      );
    }

    if (primaryMedia.type === 'image' && !imageError) {
      return (
        <div className="relative w-full h-64 overflow-hidden">
          <img
            src={primaryMedia.url}
            alt={highlight.title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            onError={() => setImageError(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          {totalMediaCount > 1 && (
            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1">
              <Text className="text-white text-xs">+{totalMediaCount - 1}</Text>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  const cardClasses = `
    group cursor-pointer transition-all duration-500 ease-out
    transform hover:scale-[1.03] hover:-translate-y-3
    shadow-lg hover:shadow-2xl hover:shadow-[#e50914]/30
    border border-[#404040] hover:border-[#e50914]/50
    bg-[#303030] hover:bg-[#353535]
    rounded-xl overflow-hidden
    backdrop-blur-sm
    animate-in fade-in slide-in-from-bottom-4 duration-500
    ${variant === 'compact' ? 'max-w-sm' : variant === 'detailed' ? 'max-w-2xl' : 'max-w-lg'}
  `;

  return (
    <Card
      className={cardClasses}
      variant="borderless"
      cover={renderMedia()}
      onClick={onClick}
      style={{
        background: 'linear-gradient(145deg, #303030 0%, #2a2a2a 100%)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(229, 9, 20, 0.1)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      hoverable
    >
      <div className="p-2">
        {/* Header with title and company */}
        <div className="mb-3">
          <Title 
            level={variant === 'compact' ? 5 : 4} 
            className="!text-white !mb-1 !font-semibold leading-tight"
            ellipsis={{ rows: 2, tooltip: true }}
          >
            {highlight.title}
          </Title>
          
          <div className="flex items-center gap-2 mb-2">
            <HomeOutlined className="text-[#e50914] text-sm" />
            <Text className="!text-[#e50914] font-medium text-sm">
              {highlight.company}
            </Text>
          </div>
        </div>

        {/* Description */}
        {highlight.description && variant !== 'compact' && (
          <div className="mb-3">
            <Paragraph 
              className="!text-white/80 !mb-0 text-sm leading-relaxed"
              ellipsis={{ 
                rows: variant === 'detailed' ? 3 : 2, 
                tooltip: highlight.description 
              }}
            >
              {highlight.description}
            </Paragraph>
          </div>
        )}

        {/* Date and metadata */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <CalendarOutlined className="text-white/60 text-xs" />
            <Text className="!text-white/60 text-xs">
              {formatDate(highlight.startDate)}
            </Text>
          </div>
          
          {totalMediaCount > 0 && (
            <Tag 
              className="!bg-[#e50914]/10 !border-[#e50914]/30 !text-[#e50914] text-xs px-2 py-0.5"
            >
              {totalMediaCount} media
            </Tag>
          )}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="mt-4 pt-3 border-t border-[#404040]/50">
            <div className="flex gap-2">
              <Button 
                type="text" 
                size="small"
                icon={<EditOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.();
                }}
                className="!text-white/80 hover:!text-[#e50914] hover:!bg-[#e50914]/10 flex-1"
              >
                Edit
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
                  className="!text-white/80 hover:!text-red-500 hover:!bg-red-500/10"
                  danger
                >
                  Delete
                </Button>
              </Popconfirm>
            </div>
          </div>
        )}
      </div>

      {/* Floating hover effect */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 rounded-xl shadow-2xl shadow-[#e50914]/10" />
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-[#e50914]/5 to-transparent" />
      </div>
    </Card>
  );
};

export default FloatingHighlightCard;
