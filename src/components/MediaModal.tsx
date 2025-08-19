'use client'

import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { Modal, Button } from 'antd';
import { PauseCircleOutlined, PlayCircleOutlined, SoundOutlined, CloseOutlined } from '@ant-design/icons';
import Image from 'next/image';
import type { Media } from '@prisma/client';

interface MediaModalProps {
  isVisible: boolean;
  onClose: () => void;
  media: Media;
  highlightTitle: string;
}

// Performance-optimized video controls
const VideoControls = memo(({ 
  isPlaying, 
  isMuted, 
  onPlayPause, 
  onMuteToggle, 
  onClose 
}: {
  isPlaying: boolean;
  isMuted: boolean;
  onPlayPause: () => void;
  onMuteToggle: () => void;
  onClose: () => void;
}) => (
  <div className="absolute top-2 sm:top-4 right-2 sm:right-4 flex gap-1 sm:gap-2 z-10">
    <Button
      type="text"
      icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
      onClick={onPlayPause}
      className="!text-white !bg-black/50 !border-0 hover:!bg-black/70 !w-8 !h-8 sm:!w-10 sm:!h-10 !rounded-full flex items-center justify-center touch-manipulation transition-all duration-200"
      size="large"
      style={{ willChange: 'transform', backfaceVisibility: 'hidden' }}
    />
    <Button
      type="text"
      icon={<SoundOutlined />}
      onClick={onMuteToggle}
      className="!text-white !border-0 !w-8 !h-8 sm:!w-10 sm:!h-10 !rounded-full flex items-center justify-center touch-manipulation transition-all duration-200"
      size="large"
      style={{ 
        willChange: 'transform', 
        backfaceVisibility: 'hidden',
        backgroundColor: isMuted ? 'rgba(239, 68, 68, 0.7)' : 'rgba(0, 0, 0, 0.5)'
      }}
    />
    <Button
      type="text"
      icon={<CloseOutlined />}
      onClick={onClose}
      className="!text-white !bg-black/50 !border-0 hover:!bg-black/70 !w-8 !h-8 sm:!w-10 sm:!h-10 !rounded-full flex items-center justify-center touch-manipulation transition-all duration-200"
      size="large"
      style={{ willChange: 'transform', backfaceVisibility: 'hidden' }}
    />
  </div>
));

VideoControls.displayName = 'VideoControls';

// Performance-optimized image controls
const ImageControls = memo(({ onClose }: { onClose: () => void }) => (
  <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-10">
    <Button
      type="text"
      icon={<CloseOutlined />}
      onClick={onClose}
      className="!text-white !bg-black/50 !border-0 hover:!bg-black/70 !w-8 !h-8 sm:!w-10 sm:!h-10 !rounded-full flex items-center justify-center touch-manipulation transition-all duration-200"
      size="large"
      style={{ willChange: 'transform', backfaceVisibility: 'hidden' }}
    />
  </div>
));

ImageControls.displayName = 'ImageControls';

const MediaModal = memo(({ isVisible, onClose, media, highlightTitle }: MediaModalProps) => {
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Optimized video controls handlers
  const handlePlayPause = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      if (isPlaying) {
        video.pause();
      } else {
        video.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const handleMuteToggle = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  // Video event handlers with performance optimization
  const handleVideoPlay = useCallback(() => setIsPlaying(true), []);
  const handleVideoPause = useCallback(() => setIsPlaying(false), []);
  const handleVideoLoadStart = useCallback(() => setIsLoading(true), []);
  const handleVideoCanPlay = useCallback(() => setIsLoading(false), []);

  // Auto-play video when modal opens
  useEffect(() => {
    if (isVisible && videoRef.current && media.type === 'video') {
      const video = videoRef.current;
      
      // Optimize video loading
      video.preload = 'metadata';
      
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch(() => {
            // Auto-play was prevented, user interaction required
            setIsPlaying(false);
          });
      }
    }
  }, [isVisible, media.type]);

  // Cleanup video when modal closes
  useEffect(() => {
    if (!isVisible && videoRef.current) {
      const video = videoRef.current;
      video.pause();
      video.currentTime = 0;
      setIsPlaying(false);
    }
  }, [isVisible]);

  const renderOptimizedMedia = useCallback(() => {
    if (media.type === 'video') {
      return (
        <div className="relative w-full h-full flex items-center justify-center bg-black">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-20">
              <div className="w-8 h-8 border-2 border-white/30 border-t-white animate-spin rounded-full" />
            </div>
          )}
          
          <video
            ref={videoRef}
            className="max-w-full max-h-full object-contain"
            muted={isMuted}
            loop
            playsInline
            onPlay={handleVideoPlay}
            onPause={handleVideoPause}
            onLoadStart={handleVideoLoadStart}
            onCanPlay={handleVideoCanPlay}
            style={{
              willChange: 'opacity',
              backfaceVisibility: 'hidden',
            }}
          >
            <source src={media.url} type="video/mp4" />
          </video>
          
          <VideoControls
            isPlaying={isPlaying}
            isMuted={isMuted}
            onPlayPause={handlePlayPause}
            onMuteToggle={handleMuteToggle}
            onClose={onClose}
          />
        </div>
      );
    }

    if (media.type === 'image') {
      return (
        <div className="relative w-full h-full flex items-center justify-center bg-black">
          <Image
            src={media.url}
            alt={highlightTitle}
            width={800}
            height={600}
            className="max-w-full max-h-full object-contain"
            priority
            quality={90}
            style={{
              willChange: 'opacity',
              backfaceVisibility: 'hidden',
            }}
            onLoadingComplete={() => setIsLoading(false)}
          />
          
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-20">
              <div className="w-8 h-8 border-2 border-white/30 border-t-white animate-spin rounded-full" />
            </div>
          )}
          
          <ImageControls onClose={onClose} />
        </div>
      );
    }

    return null;
  }, [media, highlightTitle, isPlaying, isMuted, isLoading, handlePlayPause, handleMuteToggle, onClose, handleVideoPlay, handleVideoPause, handleVideoLoadStart, handleVideoCanPlay]);

  return (
    <>
      <Modal
        open={isVisible}
        onCancel={onClose}
        footer={null}
        closable={false}
        centered
        width="95vw"
        destroyOnClose={true}
        style={{ 
          maxWidth: '1000px',
          top: 0,
        }}
        styles={{
          body: { 
            padding: 0,
            height: '70vh',
            maxHeight: '800px',
            minHeight: '400px',
            backgroundColor: '#000',
            borderRadius: '12px',
            overflow: 'hidden'
          },
          content: {
            backgroundColor: '#000',
            borderRadius: '12px',
            overflow: 'hidden',
            willChange: 'transform',
            backfaceVisibility: 'hidden',
          },
          mask: { 
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(4px)',
          }
        }}
      >
        {renderOptimizedMedia()}
      </Modal>
      
      <style jsx>{`
        :global(.ant-modal-mask) {
          backdrop-filter: blur(4px);
        }
        
        :global(.ant-modal) {
          animation: modalSlideIn 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </>
  );
});

MediaModal.displayName = 'MediaModal';

export default MediaModal;
